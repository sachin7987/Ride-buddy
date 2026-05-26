import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #16a97a, #0d8a62)",
          borderRadius: 40,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={108}
          height={108}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinejoin="round"
        >
          <path d="M5 17h14l-1.5-6.5A3 3 0 0 0 14.6 8H9.4a3 3 0 0 0-2.9 2.5L5 17Z" />
          <circle cx="8" cy="17" r="2" fill="#ffffff" stroke="none" />
          <circle cx="16" cy="17" r="2" fill="#ffffff" stroke="none" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
