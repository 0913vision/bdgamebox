import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <title>Research Lab</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
