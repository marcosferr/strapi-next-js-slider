import type { Metadata } from "next";
import Link from "next/link";
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
      <body className={grotesk.variable}>
        <nav style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          gap: '2rem',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(5, 9, 21, 0.5)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>Inicio</Link>
          <Link href="/contact" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>Contacto</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
