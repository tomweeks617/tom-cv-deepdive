"use client";

import { useCallback, useRef, useState } from "react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const MAX_MESSAGE_CHARS = 1000;
export const MAX_TURNS = 20;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const turnsUsed = messages.filter((m) => m.role === "user").length;
  const limitReached = turnsUsed >= MAX_TURNS;

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!trimmed || isLoading || limitReached) return;

      setError(null);
      setIsLoading(true);

      const history = [...messages, { role: "user" as const, content: trimmed }];
      setMessages([...history, { role: "assistant", content: "" }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Something went wrong.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, content: last.content + chunk };
            return next;
          });
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          // Drop the empty assistant placeholder, keep the user's message.
          setMessages((prev) =>
            prev[prev.length - 1]?.role === "assistant" &&
            prev[prev.length - 1].content === ""
              ? prev.slice(0, -1)
              : prev
          );
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, limitReached]
  );

  return { messages, sendMessage, isLoading, error, limitReached };
}
