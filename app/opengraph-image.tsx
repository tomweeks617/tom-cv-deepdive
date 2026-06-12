import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} | ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The preview card shown when the site is shared (LinkedIn, Slack, email).
// Rendered at build time from the same config that drives the hero.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf9",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#0f766e",
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: 10,
              textTransform: "uppercase",
            }}
          >
            {site.title}
          </div>
          <div
            style={{
              marginTop: 16,
              color: "#1c1917",
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: -3,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 20,
              color: "#78716c",
              fontSize: 34,
              lineHeight: 1.4,
              maxWidth: 980,
            }}
          >
            Interactive CV with an AI assistant. Ask it anything about his
            experience.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 72 }}>
          {site.highlights.slice(0, 3).map((stat) => (
            <div
              key={stat.label}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{ color: "#0f766e", fontSize: 56, fontWeight: 700 }}
              >
                {stat.value}
              </div>
              <div style={{ color: "#78716c", fontSize: 24 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 14,
            background: "#0f766e",
          }}
        />
      </div>
    ),
    size
  );
}
