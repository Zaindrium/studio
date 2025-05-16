
import type { Metadata } from 'next';
import '../globals.css'; // Use the global styles from the main app
// Toaster is handled by the root layout

export const metadata: Metadata = {
  title: 'LinkUP Card',
  description: 'View this LinkUP digital business card.',
  viewport: 'width=device-width, initial-scale=1, user-scalable=no',
};

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This main tag directly contains the children for this layout segment
    <main className="min-h-screen w-screen bg-background text-foreground">
      {children}
    </main>
  );
}
