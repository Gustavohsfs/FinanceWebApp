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
          background: "#08080A",
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "0% 50% 50% 50%",
            transform: "rotate(45deg)",
            background: "linear-gradient(135deg, #FF8A2B 0%, #FF6A00 100%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
