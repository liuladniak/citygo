export type ConvStatus = "waiting" | "live" | "closed" | "missed";

export type MiloConv = {
  sessionId: string;
  status: ConvStatus;
  visitorName: string | null;
  visitorEmail: string | null;
  createdAt: string;
  preview: string | null;
  lastAt: string;
  unread: number;
  typing: boolean;
  seenAt: string | null;
};

export type MiloMsg = {
  id: string;
  from: "visitor" | "milo" | "agent";
  name?: string;
  text: string;
  at: string;
};

export type MiloContextValue = {
  /** Only admins get a console; everyone else sees nothing. */
  enabled: boolean;
  available: boolean;
  setAvailable: (on: boolean) => void;
  connected: boolean;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  conversations: MiloConv[];
  messages: Record<string, MiloMsg[]>;
  selectedId: string | null;
  select: (sessionId: string | null) => void;
  send: (sessionId: string, text: string) => Promise<boolean>;
  setTyping: (sessionId: string, on: boolean) => void;
  close: (sessionId: string) => void;
  /** Waiting requests plus unread messages, for the sidebar badge and tab title. */
  attention: number;
};
