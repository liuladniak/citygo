import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, BellOff, History, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMilo } from "@/lib/miloContext";
import type { MiloConv, MiloMsg } from "@/lib/miloTypes";

const MAX_REPLY = 2000;

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function waited(iso: string, now: number) {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

const label = (c: MiloConv) => c.visitorName || "Visitor";

function ConversationList({ now }: { now: number }) {
  const { conversations, selectedId, select } = useMilo();

  if (conversations.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground text-center">
        No open chats. When a visitor asks for a person, they show up here.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {conversations.map((c) => (
        <li key={c.sessionId}>
          <button
            type="button"
            onClick={() => select(c.sessionId)}
            className={cn(
              "w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors",
              selectedId === c.sessionId && "bg-muted",
              (c.status === "closed" || c.status === "missed") && "opacity-60",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">{label(c)}</span>
              {c.status === "waiting" ? (
                <Badge variant="destructive">Waiting {waited(c.createdAt, now)}</Badge>
              ) : c.status === "live" ? (
                c.unread > 0 ? <Badge>{c.unread}</Badge> : <span className="size-2 rounded-full bg-emerald-500" />
              ) : (
                <Badge variant="outline">{c.status === "missed" ? "Missed" : "Closed"}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {c.typing ? "typing…" : c.preview ?? "No message yet"}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Bubble({ m }: { m: MiloMsg }) {
  const mine = m.from === "agent";
  const bot = m.from === "milo";
  return (
    <div className={cn("flex flex-col max-w-[85%]", mine ? "self-end items-end" : "self-start items-start")}>
      {(bot || mine) && (
        <span className="text-[11px] text-muted-foreground mb-0.5">{bot ? "Milo (bot)" : (m.name ?? "You")}</span>
      )}
      <div
        className={cn(
          "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
          mine && "bg-primary text-primary-foreground rounded-br-sm",
          m.from === "visitor" && "bg-muted rounded-bl-sm",
          bot && "bg-muted/40 text-muted-foreground border border-dashed",
        )}
      >
        {/* Visitor text is untrusted: React renders it as plain text, never as HTML. */}
        {m.text}
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5">{fmtTime(m.at)}</span>
    </div>
  );
}

function Conversation({ conv }: { conv: MiloConv }) {
  const { messages, send, setTyping, close, select } = useMilo();
  const [text, setText] = useState("");
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const list = useMemo(() => messages[conv.sessionId] ?? [], [messages, conv.sessionId]);
  const open = conv.status === "waiting" || conv.status === "live";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [list.length, conv.typing]);

  const lastAgent = [...list].reverse().find((m) => m.from === "agent");
  const showSeen = !!lastAgent && !!conv.seenAt && conv.seenAt >= lastAgent.at && list[list.length - 1] === lastAgent;

  const onChange = (v: string) => {
    setText(v);
    setFailed(false);
    setTyping(conv.sessionId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(conv.sessionId, false), 2000);
  };

  const submit = async () => {
    const t = text.trim();
    if (!t || !open) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setTyping(conv.sessionId, false);
    const ok = await send(conv.sessionId, t);
    if (ok) setText("");
    else setFailed(true);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => select(null)} aria-label="Back to chats">
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{label(conv)}</p>
          {conv.visitorEmail && <p className="text-xs text-muted-foreground truncate">{conv.visitorEmail}</p>}
        </div>
        {open && (
          <Button variant="outline" size="sm" onClick={() => close(conv.sessionId)}>
            <X /> Close chat
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
        {list.map((m) => (
          <Bubble key={m.id} m={m} />
        ))}
        {showSeen && <span className="self-end text-[11px] text-muted-foreground">Seen</span>}
        {conv.typing && <span className="self-start text-xs text-muted-foreground italic">Visitor is typing…</span>}
        {!open && (
          <p className="self-center text-xs text-muted-foreground">
            {conv.status === "missed" ? "Nobody answered in time. The visitor was told to leave a message." : "This chat is closed."}
          </p>
        )}
        <div ref={endRef} />
      </div>

      {open && (
        <form
          className="border-t p-3 flex gap-2 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Textarea
            value={text}
            maxLength={MAX_REPLY}
            rows={2}
            placeholder="Write a reply…"
            className="resize-none"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!text.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      )}
      {failed && <p className="px-3 pb-2 text-xs text-destructive">Could not send. Check your connection and try again.</p>}
    </div>
  );
}

export default function Milo() {
  const { available, setAvailable, connected, soundOn, setSoundOn, conversations, selectedId } = useMilo();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const selected = conversations.find((c) => c.sessionId === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-3 py-4 h-[calc(100svh-5rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Milo</h1>
          <p className="page-description">
            {!available
              ? "You are away. Visitors are told to leave a message."
              : connected
                ? "You are online. Visitors see that Liu is available."
                : "Connecting…"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/milo/review"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <History className="size-4" />
            Review chats
          </Link>
          <button
            type="button"
            onClick={() => setSoundOn(!soundOn)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            aria-pressed={soundOn}
          >
            {soundOn ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            Sound {soundOn ? "on" : "off"}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={available} onCheckedChange={setAvailable} />
            Available
          </label>
        </div>
      </div>

      <div className="grid flex-1 min-h-0 rounded-lg border md:grid-cols-[320px_1fr]">
        <div className={cn("min-h-0 overflow-y-auto md:border-r", selected && "hidden md:block")}>
          <ConversationList now={now} />
        </div>
        <div className={cn("min-h-0", !selected && "hidden md:flex md:items-center md:justify-center")}>
          {selected ? (
            <Conversation key={selected.sessionId} conv={selected} />
          ) : (
            <p className="text-sm text-muted-foreground">Pick a chat to reply.</p>
          )}
        </div>
      </div>
    </div>
  );
}
