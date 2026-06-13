import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Odoo Cafe POS",
  description: "A real-time, full-stack Point-of-Sale and Kitchen Display System.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen bg-canvas text-ink flex flex-col`}>
        <TopNav />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
