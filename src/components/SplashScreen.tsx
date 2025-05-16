
"use client";

import { Link as LinkIcon } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white min-h-screen">
      <LinkIcon className="h-20 w-20 mb-3 text-white" />
      <div className="text-4xl font-bold text-white">LinkUP</div>
    </div>
  );
}
