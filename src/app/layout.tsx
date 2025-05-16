
"use client"; // Required for useState and useEffect

import { useState, useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SplashScreen } from '@/components/SplashScreen';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSplashing, setIsSplashing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashing(false);
    }, 1200); // Splash duration: 1.2 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []); // Empty dependency array ensures this runs only once on mount (per session/refresh)

  if (isSplashing) {
    return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <head>
          <title>LinkUP</title>
          <meta name="description" content="Loading LinkUP..." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Add any essential links like favicon here if needed during splash */}
        </head>
        <body className="bg-black"> {/* Ensure body is black during splash */}
          <SplashScreen />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <title>LinkUP - Digital Business Cards</title>
        <meta name="description" content="Create and share your digital business card with LinkUP." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
