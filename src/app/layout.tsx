import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "co-founder.fit",
  description: "Match with a co-founder or a project to join.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
