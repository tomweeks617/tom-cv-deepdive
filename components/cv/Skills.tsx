import { skillGroups } from "@/config/cv";

export function Skills() {
  return (
    <section aria-labelledby="skills-heading">
      <h2
        id="skills-heading"
        className="text-sm font-medium uppercase tracking-widest text-accent"
      >
        Technical Skills
      </h2>
      <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
        <dl className="space-y-5">
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className="sm:grid sm:grid-cols-[12rem_1fr] sm:items-baseline sm:gap-4"
            >
              <dt className="text-sm font-medium text-muted">{group.label}</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-0">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-accent-soft px-2.5 py-1 text-sm text-accent"
                  >
                    {skill}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
