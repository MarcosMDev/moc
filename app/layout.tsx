import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Organograma Hierárquico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="dark">
      <body>{children}</body>
    </html>
  );
}
