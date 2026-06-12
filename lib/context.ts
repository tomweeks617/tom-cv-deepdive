import { promises as fs } from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

let cached: string | null = null;

/**
 * Loads every markdown file in /content, strips HTML comments (Tom's
 * editing TODOs — they must never reach the model), and wraps each file
 * in an XML tag named after the file so the model can cite sources.
 *
 * The result must be byte-identical across requests for prompt caching
 * to hit, hence the deterministic sort and module-level cache.
 */
export async function loadCvContent(): Promise<string> {
  if (cached && process.env.NODE_ENV === "production") return cached;

  const files = (await fs.readdir(CONTENT_DIR))
    .filter((f) => f.endsWith(".md"))
    .sort();

  const sections = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf-8");
      const cleaned = raw.replace(/<!--[\s\S]*?-->/g, "").trim();
      const tag = path.basename(file, ".md");
      return `<${tag}>\n${cleaned}\n</${tag}>`;
    })
  );

  cached = sections.join("\n\n");
  return cached;
}
