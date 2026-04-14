import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xokai — Gestión Escolar",
  description: "Plataforma de gestión escolar para escuelas privadas en México y LATAM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast:       'font-sans text-sm',
                title:       'font-semibold',
                description: 'text-xk-text-secondary text-xs',
                success:     'border-xk-accent-medium',
                error:       'border-xk-danger',
              },
            }}
          />
        </body>
    </html>
  );
}
