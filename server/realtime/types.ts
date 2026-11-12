export type ConversationStatus = "waiting" | "live" | "closed" | "missed";

export interface Conversation {
  sessionId: string;
  status: ConversationStatus;
  tokenHash: string;
  visitorName: string | null;
  visitorEmail: string | null;
  createdAt: string;
}

export interface StoredMessage {
  role: "visitor" | "milo" | "agent";
  text: string;
  source: string;
  at: string;
}

// Everything the live chat needs from the database. The real implementation is
// realtime/dbStore.ts; tests use an in-memory one.
export interface Store {
  getConversation(sessionId: string): Promise<Conversation | null>;
  createOrReset(input: {
    sessionId: string;
    tokenHash: string;
    name: string | null;
    email: string | null;
  }): Promise<"created" | "exists">;
  countRecent(hours: number): Promise<number>;
  markLive(sessionId: string): Promise<void>;
  close(sessionId: string, status: "closed" | "missed"): Promise<void>;
  saveMessage(sessionId: string, role: "visitor" | "agent", text: string): Promise<void>;
  listOpen(): Promise<Conversation[]>;
  history(sessionId: string, opts: { humanOnly?: boolean; limit: number }): Promise<StoredMessage[]>;
  expireWaiting(olderThanMinutes: number): Promise<Conversation[]>;
  deleteOldConversations(days: number): Promise<void>;
}
