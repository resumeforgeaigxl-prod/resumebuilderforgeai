import React from "react";

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang || 'en'}>
      <body>
        {children}
      </body>
    </html>
  );
}
