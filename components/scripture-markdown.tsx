import { Streamdown } from "streamdown";
import type { ComponentProps, ReactNode } from "react";

type MarkdownProps = {
  text: string;
  streaming?: boolean;
};

type TagProps = { children?: ReactNode };

function Paragraph({ children }: TagProps) {
  return (
    <p className="mb-4 font-serif text-[1.125rem] leading-[1.6] text-ink last:mb-0">
      {children}
    </p>
  );
}

function Heading({ children }: TagProps) {
  return (
    <h2 className="mt-6 mb-3 font-serif text-[1.45rem] leading-tight font-normal tracking-[-0.02em] text-ink first:mt-0">
      {children}
    </h2>
  );
}

function Quote({ children }: TagProps) {
  return (
    <blockquote className="my-4 border-l-2 border-gilt pl-4 font-serif text-[1.15rem] leading-[1.6] text-ink italic">
      {children}
    </blockquote>
  );
}

function Link({
  href,
  children,
}: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-gilt-ink underline decoration-gilt underline-offset-[3px]"
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

const components = {
  p: Paragraph,
  h1: Heading,
  h2: Heading,
  h3: Heading,
  blockquote: Quote,
  a: Link,
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-5 font-serif text-[1.125rem] leading-[1.6] last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-5 font-serif text-[1.125rem] leading-[1.6] last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-medium text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded-sheet bg-linen px-1 py-0.5 font-sans text-[0.92em] tracking-normal">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-sheet border border-stone bg-bone p-4 font-sans text-sm leading-relaxed tracking-normal">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-6 border-0 border-t border-stone" />,
} as ComponentProps<typeof Streamdown>["components"];

export function ScriptureMarkdown({ text, streaming = false }: MarkdownProps) {
  return (
    <Streamdown
      mode={streaming ? "streaming" : "static"}
      isAnimating={streaming}
      animated={false}
      controls={false}
      lineNumbers={false}
      components={components}
    >
      {text}
    </Streamdown>
  );
}
