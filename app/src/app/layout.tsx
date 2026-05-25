import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adega 4 Amigos | Delivery de Bebidas em Sorocaba",
  description:
    "Cervejas, destilados, refrigerantes e petiscos com entrega rapida em Sorocaba. Faca seu pedido online!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col font-[var(--font-inter)]"
        style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
      >
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
