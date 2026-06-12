import { exampleQuestions } from "@/config/site";

export function PromptChips({
  onSelect,
  disabled,
}: {
  onSelect: (question: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {exampleQuestions.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(q)}
          className="rounded-full border border-border bg-card px-3.5 py-1.5 text-left text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
