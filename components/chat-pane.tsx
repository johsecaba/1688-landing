"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EmptyState } from "@/components/empty-state";
import { ScriptureMarkdown } from "@/components/scripture-markdown";

type ChatPaneProps = {
  id: string;
  initialMessages: UIMessage[];
  onPersist: (messages: UIMessage[]) => void;
};

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n\n")
    .trim();
}

function signature(messages: UIMessage[]): string {
  const last = messages.at(-1);
  const text = last ? messageText(last).slice(-32) : "";
  return `${messages.length}:${last?.id ?? ""}:${text}`;
}

function friendlyError(error: Error | undefined): string | null {
  if (!error) return null;
  const text = error.message.trim();
  if (text.startsWith("The guide") || text.startsWith("The reply")) return text;
  const lower = text.toLowerCase();
  if (
    lower.includes("credit") ||
    lower.includes("402") ||
    lower.includes("insufficient")
  ) {
    return "The guide is unavailable until AI Gateway credits are added for this Vercel team.";
  }
  if (
    lower.includes("401") ||
    lower.includes("unauthorized") ||
    lower.includes("api key") ||
    lower.includes("api_key") ||
    lower.includes("oidc") ||
    lower.includes("unauthenticated")
  ) {
    return "The guide could not sign in. On Vercel this is automatic; a local copy needs AI_GATEWAY_API_KEY.";
  }
  return "The reply was interrupted. Please try again.";
}

export function ChatPane({ id, initialMessages, onPersist }: ChatPaneProps) {
  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    id,
    messages: initialMessages,
  });
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const latestMessages = useRef(messages);
  const savedSignature = useRef(signature(initialMessages));
  const onPersistRef = useRef(onPersist);

  const busy = status === "submitted" || status === "streaming";
  const hasConversation = messages.some((message) => message.role === "user");

  useEffect(() => {
    latestMessages.current = messages;
    onPersistRef.current = onPersist;

    const next = signature(messages);
    if (next === savedSignature.current) return;
    if (!messages.some((message) => message.role === "user")) return;

    const handle = window.setTimeout(() => {
      savedSignature.current = signature(messages);
      onPersist(messages);
    }, 300);

    return () => window.clearTimeout(handle);
  }, [messages, onPersist]);

  useEffect(() => {
    return () => {
      const current = latestMessages.current;
      const next = signature(current);
      if (next === savedSignature.current) return;
      if (!current.some((message) => message.role === "user")) return;
      savedSignature.current = next;
      onPersistRef.current(current);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  function resize(element: HTMLTextAreaElement) {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 168)}px`;
  }

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    clearError();
    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    void sendMessage({ text: trimmed });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(draft);
  }

  const notice = friendlyError(error);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[42rem] flex-col px-4 py-6 sm:px-6 sm:py-8">
          {hasConversation ? (
            <h1 className="sr-only">Conversation</h1>
          ) : null}
          {!hasConversation ? (
            <EmptyState onPrompt={ask} disabled={busy} />
          ) : (
            <ol className="flex flex-col gap-8">
              {messages.map((message) => {
                const text = messageText(message);
                if (!text && message.role === "user") return null;
                const streaming =
                  message.role === "assistant" &&
                  message.id === messages.at(-1)?.id &&
                  status === "streaming";

                if (message.role === "assistant" && !text && !streaming && status !== "submitted") {
                  return null;
                }

                if (message.role === "user") {
                  return (
                    <li key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-sheet bg-bone px-4 py-3">
                        <p className="font-sans text-[11px] font-medium tracking-[0.16em] text-quiet uppercase">
                          You
                        </p>
                        <p className="mt-1 font-sans text-[15px] leading-relaxed tracking-[0.01em] whitespace-pre-wrap text-ink [overflow-wrap:anywhere]">
                          {text}
                        </p>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={message.id} className="[overflow-wrap:anywhere]">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <p className="font-sans text-[11px] font-medium tracking-[0.16em] text-gilt-ink uppercase">
                        From the text
                      </p>
                      {text && !streaming ? (
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard.writeText(text);
                          }}
                          className="font-sans text-[11px] tracking-[0.14em] text-quiet uppercase hover:text-ink"
                        >
                          Copy
                        </button>
                      ) : null}
                    </div>
                    {text ? (
                      <ScriptureMarkdown text={text} streaming={streaming} />
                    ) : (
                      <p className="font-serif text-[1.125rem] text-gilt-ink italic">
                        Reading…
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="shrink-0 border-t border-stone bg-parchment"
      >
        <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-2 px-4 py-3 sm:px-6 sm:py-4">
          {notice ? (
            <p role="alert" className="font-sans text-[13px] tracking-[0.01em] text-gilt-ink">
              {notice}
            </p>
          ) : null}
          <p className="sr-only" role="status">
            {busy ? "Reading the question." : ""}
          </p>
          <div className="flex items-end gap-2">
            <label htmlFor="composer" className="sr-only">
              Message
            </label>
            <textarea
              id="composer"
              ref={textareaRef}
              rows={1}
              value={draft}
              placeholder="Ask the Scriptures"
              enterKeyHint="send"
              autoComplete="off"
              onChange={(event) => {
                setDraft(event.target.value);
                resize(event.target);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  ask(draft);
                }
              }}
              className="max-h-40 min-h-11 flex-1 resize-none overflow-hidden rounded-sheet border border-stone bg-bone px-3 py-2.5 font-sans text-[15px] leading-6 tracking-[0.01em] text-ink placeholder:text-quiet"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="h-11 shrink-0 rounded-sheet border border-ink px-4 font-sans text-[13px] font-medium tracking-[0.08em] text-ink uppercase hover:bg-linen"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!draft.trim()}
                className="h-11 shrink-0 rounded-sheet bg-ink px-4 font-sans text-[13px] font-medium tracking-[0.08em] text-parchment uppercase hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-linen disabled:text-quiet"
              >
                Send
              </button>
            )}
          </div>
          <p className="font-sans text-[11px] tracking-[0.08em] text-quiet uppercase">
            Enter to send
            <span className="hidden sm:inline"> · Shift+Enter for a new line</span>
          </p>
        </div>
      </form>
    </div>
  );
}
