import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css'; // Use the global styles from the main app
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LinkUP Card',
  description: 'View this LinkUP digital business card.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head /> {/* Basic head, specific meta tags handled by metadata object */}
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
