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
            position="bottom-right"
            richColors
            expand={false}
            toastOptions={{
              duration: 4000,
              classNames: {
                toast:       'font-sans text-sm shadow-lg border rounded-xl px-4 py-3',
                title:       'font-semibold text-sm',
                description: 'text-xs mt-0.5 opacity-80',
                success:     '!bg-emerald-50 !border-emerald-200 !text-emerald-800',
                error:       '!bg-red-50 !border-red-200 !text-red-800',
                warning:     '!bg-amber-50 !border-amber-200 !text-amber-800',
                info:        '!bg-violet-50 !border-violet-200 !text-violet-800',
                actionButton:'!bg-xk-accent !text-white !rounded-lg !text-xs',
                cancelButton:'!bg-xk-subtle !text-xk-text !rounded-lg !text-xs',
              },
            }}
          />
        </body>
    </html>
  );
}
