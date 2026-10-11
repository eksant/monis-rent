import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workspace Builder · monis.rent",
  description:
    "Design your Bali workspace visually, see the price instantly, and rent it.",
};

export const viewport: Viewport = { themeColor: "#F9F2EA" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
