import { site } from "@/config/site";

export function Hero() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          {site.title}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          {site.tagline}
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
          {site.highlights.map((stat) => (
            <div key={stat.label}>
              <dt className="order-last mt-1 text-sm leading-snug text-muted">
                {stat.label}
              </dt>
              <dd className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={site.cvPdfPath}
            download={site.cvPdfFilename}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14"
              />
            </svg>
            Download CV
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {site.email}
          </a>
        </div>
      </div>
    </header>
  );
}
