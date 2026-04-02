import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "永生.skill — 把任何人从聊天记录里蒸馏出来",
  description:
    "与其等着被别人蒸，不如先蒸自己。从微信、飞书、iMessage 等 12+ 平台的聊天记录中，蒸馏任何人的数字分身。",
  openGraph: {
    title: "永生.skill — 数字永生蒸馏框架",
    description: "2026 年了，所有人都在被蒸馏。但凭什么别人来决定你被蒸成什么样？",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
