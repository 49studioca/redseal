import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#1f2a37",
          padding: 72,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 34,
            fontWeight: 800,
            color: "#d8232a",
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 18,
              background: "#d8232a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            RS
          </div>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 0.96,
              fontWeight: 900,
              letterSpacing: 0,
              maxWidth: 900,
            }}
          >
            AI Red Seal Exam Prep for Canada
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.35, maxWidth: 900, color: "#475569" }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 24, color: "#1f2a37" }}>
          <span>56 Red Seal trades</span>
          <span style={{ color: "#d8232a" }}>-</span>
          <span>RSOS aligned</span>
          <span style={{ color: "#d8232a" }}>-</span>
          <span>Province-aware study</span>
        </div>
      </div>
    ),
    size,
  );
}
