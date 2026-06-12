"use client";

import { useEffect, useRef, useState } from "react";
import { useChat, MAX_MESSAGE_CHARS } from "@/lib/use-chat";
import { Message } from "./Message";
import { PromptChips } from "./PromptChips";
import { site } from "@/config/site";

export function Chat() {
  const { messages, sendMessage, isLoading, error, limitReached } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function submit(text: string) {
    sendMessage(text);
    setInput("");
  }

  return (
    <section id="ask" aria-labelledby="ask-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="ask-heading"
          className="text-sm font-medium uppercase tracking-widest text-accent"
        >
          Ask About Tom
        </h2>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
          AI assistant
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        An AI assistant that answers questions about Tom&apos;s experience,
        grounded in content he has written. It can make mistakes — for anything
        important, contact{" "}
        <a href={`mailto:${site.email}`} className="text-accent hover:underline">
          {site.email}
        </a>
        .
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        {messages.length === 0 ? (
          <div className="p-4 sm:p-5">
            <p className="mb-3 text-sm text-muted">Try one of these:</p>
            <PromptChips onSelect={submit} disabled={isLoading} />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="max-h-[28rem] space-y-4 overflow-y-auto p-4 sm:p-5"
          >
            {messages.map((m, i) => (
              <Message key={i} message={m} />
            ))}
          </div>
        )}

        {error && (
          <p className="border-t border-border px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {limitReached && (
          <p className="border-t border-border px-4 py-3 text-sm text-muted">
            That&apos;s the limit for one session — for anything else, email{" "}
            <a href={`mailto:${site.email}`} className="text-accent hover:underline">
              {site.email}
            </a>
            .
          </p>
        )}

        <form
          className="flex gap-2 border-t border-border bg-card p-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_MESSAGE_CHARS}
            placeholder="e.g. How has Tom used dbt in production?"
            disabled={isLoading || limitReached}
            aria-label="Ask a question about Tom"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || limitReached || input.trim() === ""}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </section>
  );
}
