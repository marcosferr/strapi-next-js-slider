import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk",
  weight: ["400", "500", "600", "700"],
} as const);

export const metadata: Metadata = {
  title: "Strapi + Next.js Carousel",
  description: "POC que consume un carrusel desde Strapi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={grotesk.variable}>{children}</body>
    </html>
  );
}
