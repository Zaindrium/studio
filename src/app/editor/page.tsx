
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer the primary editor.
// Its functionality has been moved to /dashboard/generator.
// It will now redirect to the dashboard or login page.
export default function OldEditorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new editor location within the dashboard,
    // or to login if not authenticated (though this page doesn't handle auth).
    // For simplicity, redirecting to the dashboard's generator page.
    router.replace('/dashboard/generator');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <p>Redirecting to the new card editor...</p>
    </div>
  );
}
