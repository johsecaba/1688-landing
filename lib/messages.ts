import type { UIMessage } from "ai";

const MAX_MESSAGES = 24;
const MAX_CHARS_PER_MESSAGE = 4_000;
const MAX_TOTAL_CHARS = 24_000;

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

/**
 * Keep only user and assistant text. System messages from the client are
 * dropped so the Bible instructions cannot be replaced from the browser.
 */
export function sanitizeMessages(input: unknown): UIMessage[] {
  if (!Array.isArray(input)) return [];

  const cleaned: UIMessage[] = [];

  for (const item of input.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== "object") continue;

    const candidate = item as {
      id?: unknown;
      role?: unknown;
      parts?: unknown;
    };

    if (candidate.role !== "user" && candidate.role !== "assistant") continue;
    if (!Array.isArray(candidate.parts)) continue;

    const parts: UIMessage["parts"] = [];

    for (const part of candidate.parts) {
      if (!part || typeof part !== "object") continue;
      const textPart = part as { type?: unknown; text?: unknown };
      if (textPart.type !== "text" || typeof textPart.text !== "string") {
        continue;
      }
      const text = textPart.text.trim().slice(0, MAX_CHARS_PER_MESSAGE);
      if (!text) continue;
      parts.push({ type: "text", text });
    }

    if (parts.length === 0) continue;

    cleaned.push({
      id:
        typeof candidate.id === "string" && candidate.id.trim()
          ? candidate.id.trim().slice(0, 100)
          : crypto.randomUUID(),
      role: candidate.role,
      parts,
    });
  }

  let total = cleaned.reduce((sum, message) => sum + textOf(message).length, 0);
  while (cleaned.length > 1 && total > MAX_TOTAL_CHARS) {
    const removed = cleaned.shift();
    if (!removed) break;
    total -= textOf(removed).length;
  }

  return cleaned;
}
