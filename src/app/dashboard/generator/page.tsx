
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
// Removed Header as this page is now within the dashboard layout
import { UserProfileForm } from '@/components/UserProfileForm';
import { CardPreview } from '@/components/CardPreview';

// OnboardingDialog might not be relevant here, or could be adapted
// import { QuickShareFAB } from '@/components/QuickShareFAB'; // FAB might conflict with dashboard structure, review later
import type { StaffCardData, CardDesignSettings } from '@/lib/app-types';
import { appTemplates, defaultStaffCardData, defaultCardDesignSettings } from '@/lib/app-types';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeForUrl } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Blocks } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


// Dynamically import larger components
const CardDesigner = dynamic(() => import('@/components/CardDesigner').then(mod => mod.CardDesigner), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});
const AiDesignAssistant = dynamic(() => import('@/components/AiDesignAssistant').then(mod => mod.AiDesignAssistant), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
});
const ShareCard = dynamic(() => import('@/components/ShareCard').then(mod => mod.ShareCard), {
  loading: () => <Skeleton className="h-[200px] w-full rounded-lg" />,
});


// const ONBOARDING_STORAGE_KEY = 'linkup_onboarding_completed_admin_context'; 

export default function GeneratorPage() { // Was EditorPage
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
  // const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // if (typeof window !== "undefined") {
    //     const onboardingCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    //     if (onboardingCompleted !== 'true') {
    //         // setShowOnboarding(true); 
    //     }
    // }
  }, []);

  useEffect(() => {
    if (isClient) {
      const cardIdentifier = sanitizeForUrl(staffCardProfile.name);
      const newQrCodeUrl = `${window.location.origin}/card/${cardIdentifier}`; // Example: /card/jane-doe-staff
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

  // const handleOnboardingClose = useCallback(() => { 
  //   setShowOnboarding(false);
  //   if (typeof window !== "undefined") {
  //       localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  //   }
  // }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* No Header component from src/components/Header here */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center"><Blocks className="mr-2 h-6 w-6 text-primary"/>Digital Card Editor</CardTitle>
                <CardDescription>Design and customize digital business cards for your staff.</CardDescription>
            </CardHeader>
          </Card>
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
        {/* No Footer component from src/components/Footer here */}
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background"> {/* Removed min-h-screen as it's part of dashboard layout */}
      {/* No Header component from src/components/Header here */}
      <main className="flex-grow px-0 py-0"> {/* Removed container and padding, handled by dashboard layout */}
        {/* {isClient && <OnboardingDialog isOpen={showOnboarding} onClose={handleOnboardingClose} />} */}
        
        <Card className="mb-6 shadow-none border-0 rounded-none">
          <CardHeader className="pb-2 pt-0 px-0">
              <CardTitle className="flex items-center text-xl"><Blocks className="mr-2 h-5 w-5 text-primary"/>Digital Card Editor</CardTitle>
              <CardDescription>Design and customize digital business cards. Start by filling the form or selecting a template.</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <UserProfileForm profile={staffCardProfile} onProfileChange={handleProfileChange} />
 <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
              <CardDesigner design={cardDesign} onDesignChange={handleDesignChange} />
 </Suspense>
 <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-lg" />}>
              <AiDesignAssistant
 userProfile={staffCardProfile}
 currentDesign={cardDesign}
 onApplySuggestions={handleAiApplySuggestions}
 onUpdateProfileForAI={handleUpdateProfileForAI}
 />
 </Suspense>
          </div>

          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
            <CardPreview profile={staffCardProfile} design={cardDesign} />
            <ShareCard cardUrl={cardDesign.qrCodeUrl} />
          </div>
        </div>
 <Suspense fallback={<Skeleton className="h-[200px] w-full rounded-lg" />}>
          <ShareCard cardUrl={cardDesign.qrCodeUrl} />
 </Suspense>
      </main>
      {/* No Footer component from src/components/Footer here */}
    </div>
  );
}
