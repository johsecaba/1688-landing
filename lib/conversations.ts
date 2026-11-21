import type { UIMessage } from "ai";

const STORAGE_KEY = "1688.bible.v1";
const MAX_CONVERSATIONS = 40;
const MAX_STORED_MESSAGES = 80;

export type Conversation = {
  id: string;
  title: string;
  messages: UIMessage[];
  updatedAt: number;
};

type Store = {
  version: 1;
  conversations: Conversation[];
};

export function createConversationId(): string {
  return crypto.randomUUID();
}

export function titleFromMessages(messages: UIMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  const text =
    firstUser?.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() ?? "";

  if (!text) return "New conversation";
  if (text.length <= 52) return text;
  return `${text.slice(0, 51).trimEnd()}…`;
}

function isConversation(value: unknown): value is Conversation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Conversation;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.updatedAt === "number" &&
    Array.isArray(candidate.messages)
  );
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Store;
    if (parsed?.version !== 1 || !Array.isArray(parsed.conversations)) {
      return [];
    }
    return parsed.conversations
      .filter(isConversation)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_CONVERSATIONS);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  const store: Store = {
    version: 1,
    conversations: conversations
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_CONVERSATIONS)
      .map((conversation) => ({
        ...conversation,
        messages: conversation.messages.slice(-MAX_STORED_MESSAGES),
      })),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function formatWhen(timestamp: number, now = Date.now()): string {
  const minutes = Math.round((now - timestamp) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}
