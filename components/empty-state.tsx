import Image from "next/image";

export const SUGGESTED_PROMPTS = [
  "Explain Romans 8:28",
  "Who was King David?",
  "What does the Bible say about forgiveness?",
] as const;

type EmptyStateProps = {
  onPrompt: (prompt: string) => void;
  disabled?: boolean;
};

export function EmptyState({ onPrompt, disabled = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-1 pb-8 pt-6 text-center sm:pt-10">
      <Image
        src="/logo.jpg"
        alt="1688.bible — a gold crown of Christ"
        width={1024}
        height={1024}
        priority
        className="h-auto w-[15.5rem] max-w-full sm:w-[18rem]"
      />
      <div className="mt-2 h-px w-10 bg-gilt" aria-hidden="true" />
      <h1 className="mt-6 font-serif text-[2rem] leading-none font-normal tracking-[-0.02em] text-ink sm:text-[2.75rem]">
        Ask the Scriptures.
      </h1>
      <p className="mt-4 max-w-[34rem] font-sans text-[15px] leading-relaxed tracking-[0.02em] text-quiet">
        A conversation kept to the Bible — its books, its people, and the life
        the text shapes. Verses are cited, never invented.
      </p>
      <ul className="mt-8 flex w-full max-w-[34rem] flex-col gap-2 text-left">
        {SUGGESTED_PROMPTS.map((prompt, index) => (
          <li key={prompt}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPrompt(prompt)}
              className="group flex w-full items-baseline gap-4 rounded-sheet border border-stone bg-bone px-4 py-3.5 text-left transition-colors hover:border-gilt hover:bg-linen disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="font-sans text-[11px] font-medium tracking-[0.16em] text-gilt-ink">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-serif text-[1.2rem] leading-snug tracking-[-0.01em] text-ink">
                {prompt}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
