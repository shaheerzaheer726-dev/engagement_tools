import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../load-env.ts";
import "./globals.css";
import SessionRefresher from "./SessionRefresher";

export const metadata: Metadata = {
  title: "Engagement Tools",
  description: "Sales, engagement, and marketing operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionRefresher />
        {children}
      </body>
    </html>
  );
}
