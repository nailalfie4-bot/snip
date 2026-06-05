export const metadata = {
  title: 'Snip — Find every subscription quietly draining your account',
  description:
    "Upload a bank statement and Snip shows what you're spending a year — and the fastest way to cancel each one. Free to scan.",
  openGraph: {
    title: 'Snip — Find every subscription quietly draining your account',
    description:
      "Upload a bank statement and Snip shows what you're spending a year — and the fastest way to cancel each one.",
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#f7f8fa' }}>{children}</body>
    </html>
  );
}
