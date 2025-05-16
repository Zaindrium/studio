
import type { Metadata } from 'next';
import '../globals.css'; // Use the global styles from the main app
import { Link as LinkIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LinkUP Authentication',
  description: 'Login or Sign up for LinkUP.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 py-6">
        <div className="container mx-auto flex items-center justify-center sm:justify-start">
          <LinkIcon className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold text-primary">LinkUP</h1>
        </div>
      </header>
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
