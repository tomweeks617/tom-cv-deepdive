import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon: TW monogram on the accent colour.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f766e",
          borderRadius: 14,
          color: "#ffffff",
          fontSize: 30,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -1,
        }}
      >
        TW
      </div>
    ),
    size
  );
}
