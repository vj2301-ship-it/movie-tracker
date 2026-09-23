import type { Metadata } from "next";
import Link from "next/link";
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
  title: "US Release Tracker",
  description:
    "Upcoming and current Hollywood movie releases in the US, with trailers, cast, and early reviews.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink">
                ▶
              </span>
              US Release Tracker
            </Link>
            <span className="hidden text-sm text-muted sm:inline">Hollywood releases in US theaters</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted sm:px-6">
            Movie data and images from{" "}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline">
              TMDB
            </a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
          </div>
        </footer>
      </body>
    </html>
  );
}
