import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickConvert.pro - Free Online File Converter',
  description: 'Convert Video, Audio, Image, PDF, Documents and Units for free in your browser.',
  icons: {
    icon: '/logo1.png',
    shortcut: '/logo1.png',
    apple: '/logo1.png',
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
        <link rel="icon" href="/logo1.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}

