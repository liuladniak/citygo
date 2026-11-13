import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Outcome = "person" | "waiting" | "missed" | "unanswered" | "bot";

type ReviewData = {
  days: number;
  totals: Record<Outcome, number> & { sessions: number; aiAnswered: number };
  sessions: {
    sessionId: string;
    startedAt: string;
    lastAt: string;
    messageCount: number;
    aiCount: number;
    visitorName: string | null;
    firstQuestion: string | null;
    outcome: Outcome;
  }[];
  topUnanswered: { text: string; count: number }[];
};

type Transcript = {
  conversation: {
    status: string;
    visitorName: string | null;
    visitorEmail: string | null;
  } | null;
  messages: {
    id: number;
    role: "visitor" | "milo" | "agent";
    text: string;
    at: string;
  }[];
};

const OUTCOME_LABEL: Record<Outcome, string> = {
  person: "Answered by you",
  waiting: "Waiting",
  missed: "Missed",
  unanswered: "Milo didn't know",
  bot: "Milo answered",
};

const OUTCOME_STYLE: Record<Outcome, string> = {
  person: "bg-emerald-600 text-white",
  waiting: "bg-amber-500 text-white",
  missed: "bg-red-600 text-white",
  unanswered: "bg-orange-500 text-white",
  bot: "bg-muted text-muted-foreground",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function TranscriptSheet({
  sessionId,
  onClose,
}: {
  sessionId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useQuery<Transcript>({
    queryKey: ["milo-transcript", sessionId],
    queryFn: async () =>
      (await axios.get(`/api/milo/review/${sessionId}`)).data,
    enabled: !!sessionId,
  });
  const c = data?.conversation;

  return (
    <Sheet open={!!sessionId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{c?.visitorName || "Visitor"}</SheetTitle>
          <SheetDescription>
            {c?.visitorEmail ?? "No email left"}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading && <Loader2 className="mx-auto mt-6 animate-spin" />}
          {isError && (
            <p className="text-sm text-destructive">Could not load this chat.</p>
          )}
          <div className="flex flex-col gap-3">
            {data?.messages.map((m) => {
              const mine = m.role === "agent";
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex max-w-[85%] flex-col",
                    mine ? "items-end self-end" : "items-start self-start",
                  )}
                >
                  <span className="mb-0.5 text-[11px] text-muted-foreground">
                    {m.role === "milo" ? "Milo (bot)" : mine ? "You" : "Visitor"}
                  </span>
                  {/* Visitor text is untrusted: plain text only. */}
                  <div
                    className={cn(
                      "whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                      mine && "bg-primary text-primary-foreground",
                      m.role === "visitor" && "bg-muted",
                      m.role === "milo" &&
                        "border border-dashed bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    {fmt(m.at)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function MiloReview() {
  const [days, setDays] = useState("30");
  const [filter, setFilter] = useState<"all" | Outcome>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<ReviewData>({
    queryKey: ["milo-review", days],
    queryFn: async () =>
      (await axios.get("/api/milo/review", { params: { days } })).data,
  });

  const sessions = (data?.sessions ?? []).filter(
    (s) => filter === "all" || s.outcome === filter,
  );

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/milo"
            className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Live chat
          </Link>
          <h1 className="text-xl font-semibold">Chat review</h1>
          <p className="text-sm text-muted-foreground">
            What visitors asked Milo and you. Chats are kept for 90 days.
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Loader2 className="mx-auto mt-10 animate-spin" />}
      {isError && (
        <p className="text-sm text-destructive">
          Could not load conversations. Try again in a moment.
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat label="Visits" value={data.totals.sessions} />
            <Stat label="Answered by you" value={data.totals.person} />
            <Stat
              label="Missed"
              value={data.totals.missed + data.totals.waiting}
            />
            <Stat label="Milo didn't know" value={data.totals.unanswered} />
            <Stat label="Answered by AI" value={data.totals.aiAnswered} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Questions Milo couldn't answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topUnanswered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing missed in this period.
                </p>
              ) : (
                <ul className="divide-y">
                  {data.topUnanswered.map((q) => (
                    <li
                      key={q.text}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      <span className="break-words">{q.text}</span>
                      <Badge variant="outline">{q.count}×</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <CardTitle className="text-base">Conversations</CardTitle>
              <Tabs
                value={filter}
                onValueChange={(v) => setFilter(v as "all" | Outcome)}
              >
                <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="person">Answered by you</TabsTrigger>
                  <TabsTrigger value="missed">Missed</TabsTrigger>
                  <TabsTrigger value="unanswered">Milo didn't know</TabsTrigger>
                  <TabsTrigger value="bot">Milo answered</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              {sessions.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No conversations here yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {sessions.map((s) => (
                    <li key={s.sessionId}>
                      <button
                        type="button"
                        onClick={() => setOpenId(s.sessionId)}
                        className="w-full px-6 py-3 text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">
                            {s.visitorName || "Visitor"}
                          </span>
                          <Badge className={OUTCOME_STYLE[s.outcome]}>
                            {OUTCOME_LABEL[s.outcome]}
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {s.firstQuestion ?? "No question typed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmt(s.lastAt)} · {s.messageCount}{" "}
                          {s.messageCount === 1 ? "message" : "messages"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <TranscriptSheet sessionId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
