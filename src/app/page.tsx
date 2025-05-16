"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserProfileForm } from '@/components/UserProfileForm';
import { CardPreview } from '@/components/CardPreview';
import { CardDesigner } from '@/components/CardDesigner';
import { AiDesignAssistant } from '@/components/AiDesignAssistant';
import { ShareCard } from '@/components/ShareCard';
import type { UserProfile, CardDesignSettings } from '@/lib/types';
import { defaultUserProfile, defaultCardDesignSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


const sanitizeForUrl = (name: string) => {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'my-card';
}

export default function HomePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [cardDesign, setCardDesign] = useState<CardDesignSettings>(defaultCardDesignSettings);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const cardIdentifier = sanitizeForUrl(userProfile.name);
      setCardDesign(prev => ({
        ...prev,
        qrCodeUrl: `${window.location.origin}/card/${cardIdentifier}`
      }));
    }
  }, [userProfile.name, isClient]);


  const handleProfileChange = useCallback((newProfile: UserProfile) => {
    setUserProfile(prevProfile => ({ ...prevProfile, ...newProfile }));
  }, []);

  const handleDesignChange = useCallback((newDesign: CardDesignSettings) => {
    setCardDesign(prevDesign => ({ ...prevDesign, ...newDesign }));
  }, []);
  
  const handleAiApplySuggestions = useCallback((suggestedDesign: Partial<CardDesignSettings>) => {
    setCardDesign(prev => {
      const newColorScheme = {
        ...prev.colorScheme,
        ...(suggestedDesign.colorScheme || {}),
      };
      // Ensure all color scheme properties exist, falling back to current if AI didn't provide one
      const finalColorScheme = {
        cardBackground: newColorScheme.cardBackground || prev.colorScheme.cardBackground,
        textColor: newColorScheme.textColor || prev.colorScheme.textColor,
        primaryColor: newColorScheme.primaryColor || prev.colorScheme.primaryColor,
      };
      
      return {
        ...prev,
        layout: suggestedDesign.layout || prev.layout,
        colorScheme: finalColorScheme,
      };
    });
  }, []);

  const handleUpdateProfileForAI = useCallback((aiData: {userInfo?: string, targetAudience?: string}) => {
    setUserProfile(prev => ({...prev, ...aiData}));
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-[600px] w-full rounded-lg" />
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
            <div className="lg:col-span-1 space-y-8">
              <Skeleton className="h-[700px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <UserProfileForm profile={userProfile} onProfileChange={handleProfileChange} />
            <CardDesigner design={cardDesign} onDesignChange={handleDesignChange} />
            <AiDesignAssistant 
              userProfile={userProfile} 
              currentDesign={cardDesign} 
              onApplySuggestions={handleAiApplySuggestions} 
              onUpdateProfileForAI={handleUpdateProfileForAI}
            />
          </div>

          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
            <CardPreview profile={userProfile} design={cardDesign} />
            <ShareCard cardUrl={cardDesign.qrCodeUrl} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
