import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iOS (iOS applies its own corner rounding).
export default function AppleIcon() {
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
          color: "#ffffff",
          fontSize: 84,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -3,
        }}
      >
        TW
      </div>
    ),
    size
  );
}
