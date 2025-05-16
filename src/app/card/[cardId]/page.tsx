
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
      
      const foundTemplate = appTemplates.find(
        (template) => sanitizeForUrl(template.profile.name) === cardId
      );

      if (foundTemplate) {
        setProfile(foundTemplate.profile);
        setDesign({
          ...foundTemplate.design,
          // The QR code URL for the public card page should link to itself
          qrCodeUrl: `${typeof window !== "undefined" ? window.location.href : ''}`, 
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

  const handleSaveContact = () => {
    if (!profile) return;

    let vcfContent = 'BEGIN:VCARD\n';
    vcfContent += 'VERSION:3.0\n';
    
    const nameParts = profile.name.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() : '';
    const firstName = nameParts.join(' ');
    vcfContent += `N:${lastName};${firstName};;;\n`;
    vcfContent += `FN:${profile.name}\n`;

    if (profile.title) vcfContent += `TITLE:${profile.title}\n`;
    if (profile.company) vcfContent += `ORG:${profile.company}\n`;
    if (profile.phone) vcfContent += `TEL;TYPE=WORK,VOICE:${profile.phone}\n`;
    if (profile.email) vcfContent += `EMAIL:${profile.email}\n`;
    if (profile.website) vcfContent += `URL:${ensureHttps(profile.website)}\n`;
    if (profile.address) vcfContent += `ADR;TYPE=WORK:;;${profile.address};;;;\n`; 
    
    if (profile.linkedin) vcfContent += `X-SOCIALPROFILE;TYPE=linkedin:${ensureHttps(profile.linkedin)}\n`;
    if (profile.twitter) vcfContent += `X-SOCIALPROFILE;TYPE=twitter:${ensureHttps(profile.twitter.startsWith('@') ? `https://twitter.com/${profile.twitter.substring(1)}` : profile.twitter)}\n`;
    if (profile.github) vcfContent += `X-SOCIALPROFILE;TYPE=github:${ensureHttps(profile.github.includes('/') ? profile.github : `https://github.com/${profile.github}`)}\n`;
    
    if (profile.profilePictureUrl && !profile.profilePictureUrl.startsWith('data:')) { // Only link if it's a URL, not data URI
         vcfContent += `PHOTO;VALUE=URL:${profile.profilePictureUrl}\n`;
     }

    if (profile.userInfo) vcfContent += `NOTE:About Me: ${profile.userInfo.replace(/\n/g, '\\n')}\n`;

    vcfContent += 'END:VCARD';
    
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = `${sanitizeForUrl(profile.name || 'contact')}.vcf`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const ensureHttps = (url: string): string => {
    if (!url) return "";
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) { 
        return `https://${url}`;
      }
    }
    return url;
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-background">
        <Skeleton className="w-full max-w-sm h-[calc(100vw_*_16/9)] sm:h-[650px] rounded-lg shadow-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 text-center bg-background">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
        <a href="/" className="mt-6 text-primary hover:underline">Go to Homepage</a>
      </div>
    );
  }

  if (profile && design) {
    // This div takes full screen and centers the CardPreview
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <CardPreview 
            profile={profile} 
            design={design} 
            isPublicView={true}
            onSaveContact={handleSaveContact} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 text-center bg-background">
        <p className="text-lg text-muted-foreground">Could not load card data.</p>
         <a href="/" className="mt-6 text-primary hover:underline">Go to Homepage</a>
    </div>
  );
}
