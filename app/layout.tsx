"use client";
import { OrganogramaProvider } from "@/components/organograma-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <OrganogramaProvider>
        <body>{children}</body>
      </OrganogramaProvider>
    </html>
  );
}
