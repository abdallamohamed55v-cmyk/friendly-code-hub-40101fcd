/** @doc Telegram bot webhook that adds a "📊 Project Stats" button for admins (visitors, registered users, countries). */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

async function tg(method: string, body: unknown) {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) console.error("TG", method, r.status, await r.text());
  return r;
}

async function isAdmin(chatId: number): Promise<boolean> {
  const { data } = await supabase
    .from("bot_admins")
    .select("telegram_chat_id")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();
  return !!data;
}

async function buildStats(): Promise<string> {
  // Registered users (auth)
  const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  const registered = (usersData as any)?.total ?? 0;

  // Recent signups (24h)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: newUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);

  // Visitors totals
  const { count: totalVisits } = await supabase
    .from("project_visits")
    .select("id", { count: "exact", head: true });
  const { count: visits24 } = await supabase
    .from("project_visits")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);

  // Top countries
  const { data: countryRows } = await supabase
    .from("project_visits")
    .select("country")
    .not("country", "is", null)
    .limit(5000);
  const counts = new Map<string, number>();
  (countryRows ?? []).forEach((r: any) => {
    const c = (r.country || "—").toString();
    counts.set(c, (counts.get(c) ?? 0) + 1);
  });
  const topCountries = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([c, n], i) => `${i + 1}. ${c} — <b>${n}</b>`)
    .join("\n") || "—";

  return (
    `📊 <b>إحصائيات المشروع</b>\n\n` +
    `👥 <b>المسجلون:</b> ${registered}\n` +
    `🆕 <b>مسجلون آخر 24س:</b> ${newUsers ?? 0}\n\n` +
    `👁 <b>إجمالي الزيارات:</b> ${totalVisits ?? 0}\n` +
    `📈 <b>زيارات آخر 24س:</b> ${visits24 ?? 0}\n\n` +
    `🌍 <b>أعلى الدول:</b>\n${topCountries}\n\n` +
    `<i>محدَّث: ${new Date().toLocaleString("ar-EG")}</i>`
  );
}

function mainKeyboard(admin: boolean) {
  const rows: any[] = [];
  if (admin) rows.push([{ text: "📊 إحصائيات المشروع", callback_data: "stats" }]);
  rows.push([{ text: "ℹ️ حول", callback_data: "about" }]);
  return { inline_keyboard: rows };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!BOT_TOKEN) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return new Response("bad json", { status: 400, headers: corsHeaders });
  }

  try {
    // Callback button
    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message?.chat?.id;
      const data = cq.data as string;
      const admin = await isAdmin(chatId);

      await tg("answerCallbackQuery", { callback_query_id: cq.id });

      if (data === "stats") {
        if (!admin) {
          await tg("sendMessage", { chat_id: chatId, text: "⛔ هذه الميزة متاحة للأدمن فقط." });
        } else {
          const text = await buildStats();
          await tg("sendMessage", {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [[{ text: "🔄 تحديث", callback_data: "stats" }]] },
          });
        }
      } else if (data === "about") {
        await tg("sendMessage", {
          chat_id: chatId,
          text: "بوت إدارة المشروع — أرسل /start لعرض القائمة.",
        });
      }
      return new Response("ok", { headers: corsHeaders });
    }

    // Messages
    const msg = update.message ?? update.edited_message;
    if (msg) {
      const chatId = msg.chat.id;
      const text = (msg.text ?? "").trim();
      const admin = await isAdmin(chatId);

      if (text === "/start" || text === "/menu") {
        await tg("sendMessage", {
          chat_id: chatId,
          text: admin ? "أهلاً بك أيها الأدمن 👑" : "أهلاً بك 👋",
          reply_markup: mainKeyboard(admin),
        });
      } else if (text === "/stats") {
        if (!admin) {
          await tg("sendMessage", { chat_id: chatId, text: "⛔ الأمر مخصص للأدمن." });
        } else {
          const s = await buildStats();
          await tg("sendMessage", {
            chat_id: chatId,
            text: s,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [[{ text: "🔄 تحديث", callback_data: "stats" }]] },
          });
        }
      }
    }
  } catch (e) {
    console.error("handler error", e);
  }

  return new Response("ok", { headers: corsHeaders });
});
