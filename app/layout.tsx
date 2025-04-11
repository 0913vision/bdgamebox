import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <title>Birthday2025</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
