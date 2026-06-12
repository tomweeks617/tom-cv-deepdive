import { experience } from "@/config/cv";
import type { ReactNode } from "react";

function parseBold(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function Experience() {
  return (
    <section aria-labelledby="experience-heading">
      <h2
        id="experience-heading"
        className="text-sm font-medium uppercase tracking-widest text-accent"
      >
        Experience
      </h2>
      <div className="mt-6 space-y-12">
        {experience.map((role) => (
          <article
            key={`${role.company}-${role.period}`}
            className="rounded-xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-xl font-semibold tracking-tight">
                {role.url ? (
                  <a
                    href={role.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    {role.company}
                  </a>
                ) : (
                  role.company
                )}
              </h3>
              <p className="text-sm tabular-nums text-muted">{role.period}</p>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">
              {role.title}
            </p>
            <p className="mt-1 text-sm italic text-muted">{role.descriptor}</p>
            {role.note && (
              <p className="mt-1 text-sm text-muted">{role.note}</p>
            )}
            <ul className="mt-4 space-y-2.5">
              {role.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-[15px] leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/60"
                  />
                  <span>{parseBold(bullet)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
