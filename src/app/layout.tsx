
"use client"; 

import { Inter, Roboto_Mono } from 'next/font/google'; // Changed imports
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ // Changed from Geist_Sans
  variable: '--font-inter', // Updated CSS variable name
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ // Changed from Geist_Mono
  variable: '--font-roboto-mono', // Updated CSS variable name
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable} antialiased`}>
      <head>
        <title>LinkUP - Digital Business Cards</title>
        <meta name="description" content="Create and share your digital business card with LinkUP." />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3F51B5" />
        {/* Add links for actual app icons if you have them */}
        {/* e.g., <link rel="icon" href="/favicon.ico" /> */}
        {/* <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" /> */}
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
