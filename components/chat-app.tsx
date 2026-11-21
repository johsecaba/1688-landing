"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { UIMessage } from "ai";
import { ChatPane } from "@/components/chat-pane";
import { Sidebar } from "@/components/sidebar";
import {
  createConversationId,
  loadConversations,
  saveConversations,
  titleFromMessages,
  type Conversation,
} from "@/lib/conversations";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type Session = {
  conversations: Conversation[];
  activeId: string;
};

export function ChatApp() {
  const hydrated = useHydrated();
  const [session, setSession] = useState<Session | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (hydrated && session === null) {
    const loaded = loadConversations();
    setSession({
      conversations: loaded,
      activeId: loaded[0]?.id ?? createConversationId(),
    });
  }

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    function closeOnDesktop() {
      if (media.matches) setDrawerOpen(false);
    }
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  const persist = useCallback((id: string, messages: UIMessage[]) => {
    setSession((current) => {
      if (!current) return current;
      const nextConversation: Conversation = {
        id,
        title: titleFromMessages(messages),
        messages,
        updatedAt: Date.now(),
      };
      const conversations = [
        nextConversation,
        ...current.conversations.filter((item) => item.id !== id),
      ];
      saveConversations(conversations);
      return { ...current, conversations };
    });
  }, []);

  function startNewChat() {
    setSession((current) =>
      current
        ? { ...current, activeId: createConversationId() }
        : current,
    );
    setDrawerOpen(false);
  }

  function selectConversation(id: string) {
    setSession((current) => (current ? { ...current, activeId: id } : current));
    setDrawerOpen(false);
  }

  function deleteConversation(id: string) {
    setSession((current) => {
      if (!current) return current;
      const conversations = current.conversations.filter((item) => item.id !== id);
      saveConversations(conversations);
      return {
        conversations,
        activeId:
          current.activeId === id
            ? (conversations[0]?.id ?? createConversationId())
            : current.activeId,
      };
    });
  }

  const conversations = session?.conversations ?? [];
  const activeId = session?.activeId ?? null;
  const active = conversations.find((item) => item.id === activeId);
  const initialMessages = active?.messages ?? [];

  const sidebar = (
    <Sidebar
      conversations={conversations}
      activeId={activeId}
      showTimes={session !== null}
      onNewChat={startNewChat}
      onSelect={selectConversation}
      onDelete={deleteConversation}
    />
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-parchment text-ink">
      <aside className="hidden w-[17.75rem] shrink-0 border-r border-stone md:flex md:flex-col">
        {sidebar}
      </aside>

      <div
        className={`fixed inset-0 z-40 md:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        inert={drawerOpen ? undefined : true}
        aria-hidden={drawerOpen ? undefined : true}
      >
        <button
          type="button"
          aria-label="Close conversations"
          tabIndex={drawerOpen ? 0 : -1}
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="conversations"
          className={`absolute inset-y-0 left-0 flex w-[min(100%,20rem)] transition-transform ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            showTimes={session !== null}
            onNewChat={startNewChat}
            onSelect={selectConversation}
            onDelete={deleteConversation}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col" inert={drawerOpen ? true : undefined}>
        <header className="grid h-14 shrink-0 grid-cols-[auto_1fr_auto] items-center border-b border-stone px-3 md:hidden">
          <button
            type="button"
            aria-expanded={drawerOpen}
            aria-controls="conversations"
            onClick={() => setDrawerOpen(true)}
            className="rounded-sheet px-2 py-1 font-sans text-[12px] tracking-[0.1em] text-ink uppercase"
          >
            Chats
          </button>
          <p className="text-center font-serif text-[1.25rem] leading-none tracking-[-0.02em]">
            1688.bible
          </p>
          <span className="w-12" aria-hidden="true" />
        </header>

        {hydrated && activeId ? (
          <ChatPane
            key={activeId}
            id={activeId}
            initialMessages={initialMessages}
            onPersist={(messages) => persist(activeId, messages)}
          />
        ) : (
          <div className="flex-1 bg-parchment" />
        )}
      </div>
    </div>
  );
}
