import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickConvert Pro - Free Online File Converter',
  description: 'Convert Video, Audio, Image, PDF, Documents and Units for free in your browser.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}

