
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the login page
    router.replace('/login');
  }, [router]);

  // Render a minimal loading state or nothing while redirecting
  // This content will likely only flash briefly, if at all.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Skeleton className="h-12 w-1/2 rounded-lg mb-4" />
      <Skeleton className="h-8 w-1/3 rounded-lg" />
    </div>
  );
}
