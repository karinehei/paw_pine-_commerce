import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#F3F0EA",
        color: "#1A1814",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
      }}
    >
      <div
        style={{
          fontSize: 28,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#6B6560",
        }}
      >
        Oslo
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 72, fontFamily: "Georgia, serif" }}>{SITE_NAME}</div>
        <div style={{ fontSize: 32, color: "#6B6560" }}>
          Considered essentials for dogs and cats
        </div>
      </div>
    </div>,
    size,
  );
}
