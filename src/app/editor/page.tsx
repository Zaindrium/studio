
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserProfileForm } from '@/components/UserProfileForm';
import { CardPreview } from '@/components/CardPreview';
import { CardDesigner } from '@/components/CardDesigner';
import { AiDesignAssistant } from '@/components/AiDesignAssistant';
import { ShareCard } from '@/components/ShareCard';
import { OnboardingDialog } from '@/components/OnboardingDialog'; // This might be less relevant now
import { QuickShareFAB } from '@/components/QuickShareFAB';
import type { StaffCardData, CardDesignSettings } from '@/lib/app-types'; // Updated type
import { appTemplates, defaultStaffCardData, defaultCardDesignSettings } from '@/lib/app-types'; // Updated imports
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeForUrl } from '@/lib/utils';


const ONBOARDING_STORAGE_KEY = 'linkup_onboarding_completed_admin_context'; // Changed key context

export default function EditorPage() {
  // Initialize with the first app template or default data if appTemplates is empty
  const initialTemplate = appTemplates.length > 0 ? appTemplates[0] : {
    id: 'default-staff-card',
    name: 'Default Staff Card',
    description: 'A default card if no templates are found.',
    profile: defaultStaffCardData,
    design: defaultCardDesignSettings,
  };

  const [staffCardProfile, setStaffCardProfile] = useState<StaffCardData>(initialTemplate.profile);
  const [cardDesign, setCardDesign] = useState<CardDesignSettings>(initialTemplate.design);
  const [isClient, setIsClient] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false); // Onboarding might be re-purposed for admin context

  useEffect(() => {
    setIsClient(true);
    // Onboarding logic might change based on admin-only flow
    if (typeof window !== "undefined") {
        const onboardingCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (onboardingCompleted !== 'true') {
            // setShowOnboarding(true); // Decide if onboarding is still needed here or moved to dashboard
        }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      const cardIdentifier = sanitizeForUrl(staffCardProfile.name);
      // This URL would be the "fingerprint URL" for a staff card in the new model
      const newQrCodeUrl = `${window.location.origin}/card/${cardIdentifier}`;
      setCardDesign(prev => {
        if (prev.qrCodeUrl !== newQrCodeUrl) {
          return { ...prev, qrCodeUrl: newQrCodeUrl };
        }
        return prev;
      });
    }
  }, [staffCardProfile.name, isClient]);


  const handleProfileChange = useCallback((newProfileData: Partial<StaffCardData>) => {
    setStaffCardProfile(currentProfile => {
      const potentialNextProfile = { ...currentProfile, ...newProfileData };
      let hasActuallyChanged = false;
      const allKeys = new Set([...Object.keys(currentProfile), ...Object.keys(potentialNextProfile)]) as Set<keyof StaffCardData>;

      for (const key of allKeys) {
        if (currentProfile[key] !== potentialNextProfile[key]) {
          hasActuallyChanged = true;
          break;
        }
      }
      if (hasActuallyChanged) return potentialNextProfile;
      return currentProfile;
    });
  }, []);

  const handleDesignChange = useCallback((newDesignData: Partial<CardDesignSettings>) => {
    setCardDesign(currentDesign => {
        const potentialNextDesign = { ...currentDesign, ...newDesignData };
        let hasActuallyChanged = false;
        const topLevelKeys = ['template', 'layout', 'qrCodeUrl'] as const;
        for (const key of topLevelKeys) {
            if (currentDesign[key] !== potentialNextDesign[key]) { hasActuallyChanged = true; break; }
        }
        if (!hasActuallyChanged && potentialNextDesign.colorScheme) {
            const currentColorScheme = currentDesign.colorScheme || { cardBackground: '', textColor: '', primaryColor: '' };
            const nextColorScheme = potentialNextDesign.colorScheme;
            const colorSchemeKeys = ['cardBackground', 'textColor', 'primaryColor'] as const;
            for (const key of colorSchemeKeys) {
                if (currentColorScheme[key] !== nextColorScheme[key]) { hasActuallyChanged = true; break; }
            }
        }
        if (hasActuallyChanged) return potentialNextDesign;
        return currentDesign;
    });
  }, []);
  
  const handleAiApplySuggestions = useCallback((suggestedDesign: Partial<CardDesignSettings>) => {
    setCardDesign(prev => {
      const newColorSchemePartial = suggestedDesign.colorScheme || {};
      const currentColorScheme = prev.colorScheme || { cardBackground: '', textColor: '', primaryColor: '' };
      const finalColorScheme = {
        cardBackground: newColorSchemePartial.cardBackground || currentColorScheme.cardBackground,
        textColor: newColorSchemePartial.textColor || currentColorScheme.textColor,
        primaryColor: newColorSchemePartial.primaryColor || currentColorScheme.primaryColor,
      };
      return { ...prev, layout: suggestedDesign.layout || prev.layout, colorScheme: finalColorScheme };
    });
  }, []);

  const handleUpdateProfileForAI = useCallback((aiData: Partial<StaffCardData>) => { 
    handleProfileChange(aiData);
  }, [handleProfileChange]);

  const handleOnboardingClose = useCallback(() => { 
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    }
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Skeleton className="h-[180px] w-full rounded-lg mb-8" /> 
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

  // This editor page might now represent an admin editing a *specific staff card*
  // or a template. Its role needs to be clarified in the new flow.
  // For now, it continues to function as a standalone editor using StaffCardData.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isClient && <OnboardingDialog isOpen={showOnboarding} onClose={handleOnboardingClose} />}
        
        <div className="text-center mb-4 p-2 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md">
           Note: This editor page is currently detached from the admin-only workflow. 
           Card management for staff will primarily occur within the Business Dashboard.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <UserProfileForm profile={staffCardProfile} onProfileChange={handleProfileChange} />
            <CardDesigner design={cardDesign} onDesignChange={handleDesignChange} />
            <AiDesignAssistant 
              userProfile={staffCardProfile} 
              currentDesign={cardDesign} 
              onApplySuggestions={handleAiApplySuggestions} 
              onUpdateProfileForAI={handleUpdateProfileForAI}
            />
          </div>

          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
            <CardPreview profile={staffCardProfile} design={cardDesign} />
            <ShareCard cardUrl={cardDesign.qrCodeUrl} />
          </div>
        </div>
        {isClient && <QuickShareFAB cardUrl={cardDesign.qrCodeUrl} />}
      </main>
      <Footer />
    </div>
  );
}
