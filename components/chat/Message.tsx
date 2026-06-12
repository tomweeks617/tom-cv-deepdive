import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/use-chat";

export function Message({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-white">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="prose-chat max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed">
        {message.content === "" ? (
          <span className="inline-flex gap-1 py-1" aria-label="Thinking…">
            <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
          </span>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
