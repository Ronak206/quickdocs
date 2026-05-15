import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickDocs - Professional Document Builder",
  description: "Create professional PDF documents with drag-and-drop template builder. Generate invoices, receipts, contracts, and more.",
  keywords: ["QuickDocs", "PDF Generator", "Document Builder", "Template Editor", "Invoice", "Receipt", "Contract", "Next.js", "React"],
  authors: [{ name: "QuickDocs Team" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "QuickDocs - Professional Document Builder",
    description: "Create professional PDF documents with drag-and-drop template builder",
    url: "https://quickdocs.app",
    siteName: "QuickDocs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickDocs - Professional Document Builder",
    description: "Create professional PDF documents with drag-and-drop template builder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
