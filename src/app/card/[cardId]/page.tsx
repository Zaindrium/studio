
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Corrected import for App Router
import { CardPreview } from '@/components/CardPreview';
import { appTemplates } from '@/lib/types';
import type { UserProfile, CardDesignSettings } from '@/lib/types';
import { sanitizeForUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicCardPage() {
  const params = useParams();
  const cardId = typeof params.cardId === 'string' ? params.cardId : '';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [design, setDesign] = useState<CardDesignSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cardId) {
      setIsLoading(true);
      setError(null);
      // Simulate async data fetching if needed, for now direct find
      const foundTemplate = appTemplates.find(
        (template) => sanitizeForUrl(template.profile.name) === cardId
      );

      if (foundTemplate) {
        setProfile(foundTemplate.profile);
        // Adjust QR code URL for the public card page to ensure it's absolute
        // or points to a shareable resource if different from editor's view
        const publicFacingQrUrl = `${window.location.origin}/card/${cardId}`;
        setDesign({
          ...foundTemplate.design,
          qrCodeUrl: publicFacingQrUrl, 
        });
      } else {
        setError('Card not found. The link may be incorrect or the card may have been removed.');
      }
      setIsLoading(false);
    } else {
        setError('No card ID provided.');
        setIsLoading(false);
    }
  }, [cardId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Skeleton className="w-full max-w-md h-[400px] rounded-lg shadow-xl" />
        <Skeleton className="mt-6 w-full max-w-md h-[100px] rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
        <a href="/" className="mt-6 text-primary hover:underline">Go to Homepage</a>
      </div>
    );
  }

  if (profile && design) {
    return (
      <div className="flex items-center justify-center w-full">
        {/* CardPreview itself is sticky, so centering its container might be enough */}
        <CardPreview profile={profile} design={design} />
      </div>
    );
  }

  // Fallback for unexpected states, though error state should cover most issues.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <p className="text-lg text-muted-foreground">Could not load card data.</p>
         <a href="/" className="mt-6 text-primary hover:underline">Go to Homepage</a>
    </div>
  );
}
