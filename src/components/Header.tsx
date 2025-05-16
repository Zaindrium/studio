
"use client"; // Added to use useRouter

import { Button } from '@/components/ui/button';
import { Link as LinkIcon, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Link from 'next/link'; // Import Link

export function Header() {
  const router = useRouter(); // Initialize useRouter

  const handleLogout = () => {
    // In a real app, you would also clear any authentication tokens/session state here
    console.log("Logout clicked, redirecting to /login");
    router.push('/login');
  };

  return (
    <header className="py-6 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Invisible spacer to help center the logo/title when justify-between is used with a right-aligned item */}
        <div className="w-24 flex-shrink-0">
          {/* This div is intentionally left empty or could hold a placeholder if needed for balance */}
        </div>

        <Link href="/editor" className="flex flex-col items-center text-center no-underline hover:opacity-90">
          <div className="flex items-center">
            <LinkIcon className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">LinkUP</h1>
          </div>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Modern Digital Cards, Effortless Networking.
          </p>
        </Link>

        <Button
          variant="outline"
          className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground w-24 flex-shrink-0"
          onClick={handleLogout} // Updated onClick handler
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
