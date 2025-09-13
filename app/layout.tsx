import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import { DocumentProcessingProvider } from "@/contexts/DocumentProcessingContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hagee - Gamified Learning Platform",
  description:
    "Transform your study materials into engaging AI-powered quizzes",
  generator: "Hagee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        >
          <DocumentProcessingProvider>{children}</DocumentProcessingProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
