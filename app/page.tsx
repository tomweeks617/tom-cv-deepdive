import { Hero } from "@/components/Hero";
import { Experience } from "@/components/cv/Experience";
import { Skills } from "@/components/cv/Skills";
import { Education } from "@/components/cv/Education";
import { Chat } from "@/components/chat/Chat";
import { site } from "@/config/site";

export default function Home() {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-16 px-6 py-16">
        <Chat />
        <Experience />
        <Skills />
        <Education />
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-6 py-8 text-sm text-muted">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="transition-colors hover:text-accent"
          >
            {site.email}
          </a>
        </div>
      </footer>
    </>
  );
}
