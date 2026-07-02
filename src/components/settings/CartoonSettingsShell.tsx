/** @doc Mobile settings shell — glass redesign. Exports keep cartoon names for back-compat. */
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export function CartoonHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-20 border-b border-border/40 backdrop-blur-xl"
      style={{ background: "hsl(var(--background) / 0.7)" }}
    >
      <div className="max-w-lg mx-auto px-4 flex items-center justify-between py-3 safe-top">
        <button
          onClick={() => (onBack ? onBack() : navigate("/settings"))}
          className="ios26-glass relative grid h-10 w-10 place-items-center rounded-full active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 relative z-[1] text-foreground" strokeWidth={2.2} />
        </button>
        <h1 className="text-[16px] font-semibold tracking-tight truncate">{title}</h1>
        <div className="w-10" />
      </div>
    </header>
  );
}

export function CartoonHero({
  sticker,
  bg,
  title,
  subtitle,
  trailing,
}: {
  sticker?: string;
  bg?: string;
  title?: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="ios26-glass-strong relative rounded-[28px] p-5 mt-2 overflow-hidden"
    >
      {/* Soft tinted glow using the legacy bg as a hue hint */}
      {bg && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full blur-3xl opacity-50"
          style={{ background: bg }}
        />
      )}
      <div className="relative z-[1] flex items-center gap-4">
        {sticker && (
          <div className="shrink-0 grid h-16 w-16 place-items-center rounded-2xl bg-white/40 dark:bg-white/10 ring-1 ring-white/50 dark:ring-white/10">
            <img src={sticker} alt="" className="h-12 w-12 object-contain" loading="lazy" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h2 className="text-[19px] font-semibold tracking-tight text-foreground leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed">{subtitle}</p>
          )}
          {trailing}
        </div>
      </div>
    </motion.div>
  );
}

export function CartoonPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground overflow-y-auto safe-bottom">
      {/* Ambient glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] -z-0 opacity-70 dark:opacity-50"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%), radial-gradient(40% 40% at 90% 10%, hsl(var(--accent) / 0.16), transparent 70%)",
        }}
      />
      <CartoonHeader title={title} />
      <div className="relative z-[1] max-w-lg mx-auto px-4 pt-1 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function CartoonCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  // Detect the legacy `!p-0` opt-out used by list-style cards.
  const noPad = /(^|\s)!p-0(\s|$)/.test(className);
  return (
    <div className={`ios26-glass relative rounded-2xl overflow-hidden mt-3 ${className}`}>
      <div className={`relative z-[1] ${noPad ? "" : "p-5"}`}>{children}</div>
    </div>
  );
}
