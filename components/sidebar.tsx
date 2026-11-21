import Image from "next/image";
import {
  formatWhen,
  type Conversation,
} from "@/lib/conversations";

type SidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  showTimes: boolean;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
};

export function Sidebar({
  conversations,
  activeId,
  showTimes,
  onNewChat,
  onSelect,
  onDelete,
  onClose,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-bone">
      <div className="flex items-start justify-between gap-3 px-4 pt-5 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/mark.png"
            alt=""
            width={601}
            height={601}
            className="size-10 shrink-0"
          />
          <div className="min-w-0">
            <p className="truncate font-serif text-[1.35rem] leading-none tracking-[-0.02em] text-ink">
              1688.bible
            </p>
            <p className="mt-1 font-sans text-[11px] tracking-[0.12em] text-quiet uppercase">
              Scripture only
            </p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-sheet px-2 py-1 font-sans text-[12px] tracking-[0.08em] text-quiet uppercase hover:text-ink"
          >
            Close
          </button>
        ) : null}
      </div>
      <div className="px-4">
        <div className="h-px w-10 bg-gilt" aria-hidden="true" />
        <button
          type="button"
          onClick={onNewChat}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-sheet bg-ink font-sans text-[13px] font-medium tracking-[0.08em] text-parchment uppercase hover:bg-ink-soft"
        >
          New chat
        </button>
      </div>
      <nav
        aria-label="Past conversations"
        className="mt-5 min-h-0 flex-1 overflow-y-auto px-2 pb-4"
      >
        {conversations.length === 0 ? (
          <p className="px-2 font-sans text-[13px] leading-relaxed tracking-[0.02em] text-quiet">
            Your conversations will gather here, on this device.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {conversations.map((conversation) => {
              const selected = conversation.id === activeId;
              return (
                <li key={conversation.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={selected ? "page" : undefined}
                    className={`flex w-full flex-col gap-1 rounded-sheet py-2.5 pr-10 pl-3 text-left ${
                      selected ? "bg-linen" : "hover:bg-linen"
                    }`}
                  >
                    <span className="line-clamp-2 font-sans text-[14px] leading-snug tracking-[0.01em] text-ink">
                      {conversation.title}
                    </span>
                    {showTimes ? (
                      <span className="font-sans text-[11px] tracking-[0.08em] text-quiet uppercase">
                        {formatWhen(conversation.updatedAt)}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(conversation.id)}
                    aria-label={`Delete ${conversation.title}`}
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-sheet px-2 py-1 font-sans text-[11px] tracking-[0.08em] text-quiet uppercase opacity-100 hover:text-ink md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
      <p className="border-t border-stone px-4 py-4 font-sans text-[12px] leading-relaxed tracking-[0.02em] text-quiet">
        Off-topic questions are turned back to the text. Nothing here is stored
        on a server.
      </p>
    </div>
  );
}
