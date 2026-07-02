/** @doc Kimi Coder live panel — shows todo plan, streamed files, and bash logs while the agent runs. */
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, FileCode, Terminal, ListTodo, X } from "lucide-react";
import { runKimiCoder, type KimiEvent, type KimiFile, type KimiTodo } from "@/lib/kimiCoder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BashLog = { command: string; output: string; ok: boolean };

interface Props {
  prompt: string;
  onClose: () => void;
  onFinish?: (files: KimiFile[], summary?: string) => void;
}

export default function KimiCoderPanel({ prompt, onClose, onFinish }: Props) {
  const [todos, setTodos] = useState<KimiTodo[]>([]);
  const [files, setFiles] = useState<Map<string, string>>(new Map());
  const [bash, setBash] = useState<BashLog[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"running" | "done" | "error">("running");
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [tab, setTab] = useState<"plan" | "files" | "logs">("plan");
  const started = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const ac = new AbortController();
    abortRef.current = ac;
    runKimiCoder({
      prompt,
      signal: ac.signal,
      onEvent: (ev: KimiEvent) => {
        if (ev.type === "todo") setTodos(ev.todos);
        else if (ev.type === "file") {
          setFiles((prev) => {
            const next = new Map(prev);
            next.set(ev.path, ev.content);
            return next;
          });
          setSelectedFile((cur) => cur ?? ev.path);
        } else if (ev.type === "bash")
          setBash((prev) => [...prev, { command: ev.command, output: ev.output, ok: ev.ok }]);
        else if (ev.type === "text") setText((t) => t + ev.text);
        else if (ev.type === "done") {
          setStatus("done");
          onFinish?.(ev.files, ev.summary);
        } else if (ev.type === "error") {
          setStatus("error");
          setError(ev.error);
        }
      },
    }).catch((e) => {
      setStatus("error");
      setError(e?.message || "network error");
    });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            {status === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : status === "done" ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Kimi Coder</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {status === "running"
                ? `Building… ${doneCount}/${todos.length || "?"} steps · ${files.size} files`
                : status === "done"
                  ? `Done · ${files.size} files created`
                  : `Error: ${error}`}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b px-2 py-1.5">
          {(
            [
              { id: "plan", icon: ListTodo, label: "الخطة", count: todos.length },
              { id: "files", icon: FileCode, label: "الملفات", count: files.size },
              { id: "logs", icon: Terminal, label: "السجل", count: bash.length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                tab === t.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count > 0 && (
                <span className="rounded-full bg-background px-1.5 text-[10px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {tab === "plan" && (
            <div className="h-full overflow-y-auto p-4">
              {todos.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  {status === "running" ? "Preparing plan…" : "No plan"}
                </div>
              )}
              <ul className="space-y-2">
                {todos.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start gap-2.5 rounded-lg border bg-background/50 px-3 py-2"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded",
                        t.done ? "bg-emerald-500 text-white" : "border",
                      )}
                    >
                      {t.done && <Check className="h-3 w-3" />}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        t.done && "text-muted-foreground line-through",
                      )}
                    >
                      {t.title}
                    </span>
                  </li>
                ))}
              </ul>
              {text && (
                <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs">
                  {text}
                </pre>
              )}
            </div>
          )}

          {tab === "files" && (
            <div className="flex h-full">
              <div className="w-56 shrink-0 overflow-y-auto border-r p-2">
                {Array.from(files.keys())
                  .sort()
                  .map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={cn(
                        "block w-full truncate rounded px-2 py-1 text-left text-xs",
                        selectedFile === path ? "bg-primary/10 text-primary" : "hover:bg-muted",
                      )}
                    >
                      {path}
                    </button>
                  ))}
                {files.size === 0 && (
                  <div className="p-2 text-xs text-muted-foreground">No files yet…</div>
                )}
              </div>
              <div className="flex-1 overflow-auto bg-muted/20">
                {selectedFile ? (
                  <pre className="p-3 text-xs leading-relaxed">
                    <code>{files.get(selectedFile)}</code>
                  </pre>
                ) : (
                  <div className="p-4 text-xs text-muted-foreground">Select a file</div>
                )}
              </div>
            </div>
          )}

          {tab === "logs" && (
            <div className="h-full overflow-y-auto bg-black p-3 font-mono text-xs text-green-300">
              {bash.length === 0 && <div className="text-muted-foreground">No commands yet…</div>}
              {bash.map((b, i) => (
                <div key={i} className="mb-2">
                  <div className={cn("font-semibold", b.ok ? "text-cyan-300" : "text-red-400")}>
                    $ {b.command}
                  </div>
                  <div className="whitespace-pre-wrap opacity-80">{b.output}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
