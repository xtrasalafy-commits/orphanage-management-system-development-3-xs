import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SIMPA Nur Kasih — Sistem Manajemen Panti Asuhan",
    template: "%s · SIMPA Nur Kasih",
  },
  description:
    "Sistem informasi manajemen Panti Asuhan Nur Kasih: pendataan anak yatim, piatu & dhuafa, pengasuh, donasi, kebutuhan dasar, dan kegiatan perlindungan anak.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="bg-cream font-sans text-stone-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
