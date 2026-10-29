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
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </header>
  );
}
