import { education } from "@/config/cv";

export function Education() {
  return (
    <section aria-labelledby="education-heading">
      <h2
        id="education-heading"
        className="text-sm font-medium uppercase tracking-widest text-accent"
      >
        Education
      </h2>
      <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
        <ul className="space-y-4">
          {education.map((entry) => (
            <li key={entry.institution}>
              <p className="font-semibold tracking-tight">
                {entry.institution}
              </p>
              <p className="text-[15px] text-foreground">
                {entry.qualification}{" "}
                <span className="text-muted">— {entry.detail}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
