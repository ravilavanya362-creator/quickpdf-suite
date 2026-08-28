import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickPDF Suite - Client-Side PDF Tools",
  description: "Fast, 100% private in-browser PDF conversion, merge, split, and compression tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" 
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}

