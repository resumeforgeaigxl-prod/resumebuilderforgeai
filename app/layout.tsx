import React from "react";
import "./globals.css";

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang || 'en'}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
