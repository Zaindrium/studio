
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { UserProfileForm } from '@/components/UserProfileForm';
import { CardPreview } from '@/components/CardPreview';
import type { StaffCardData, CardDesignSettings } from '@/lib/app-types';
import { defaultStaffCardData, defaultCardDesignSettings, APP_TEMPLATES } from '@/lib/app-types'; // Import APP_TEMPLATES
import { sanitizeForUrl } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Blocks } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
// TemplatePicker is not being used for now, so import can be removed if not re-added
// import { TemplatePicker } from '@/components/TemplatePicker'; 

const CardDesigner = dynamic(() => import('@/components/CardDesigner').then(mod => mod.CardDesigner), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});
const AiDesignAssistant = dynamic(() => import('@/components/AiDesignAssistant').then(mod => mod.AiDesignAssistant), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
});
const ShareCard = dynamic(() => import('@/components/ShareCard').then(mod => mod.ShareCard), {
  loading: () => <Skeleton className="h-[200px] w-full rounded-lg" />,
});

export default function GeneratorPage() {
  // Initialize with the first template from APP_TEMPLATES or defaults if empty
  const initialTemplate = APP_TEMPLATES.length > 0 ? APP_TEMPLATES[0] : { profile: defaultStaffCardData, design: defaultCardDesignSettings };

  const [staffCardProfile, setStaffCardProfile] = useState<StaffCardData>(initialTemplate.profile);
  const [cardDesign, setCardDesign] = useState<CardDesignSettings>(initialTemplate.design);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set initial state from the chosen template
    setStaffCardProfile(initialTemplate.profile);
    setCardDesign(initialTemplate.design);
  }, [initialTemplate.profile, initialTemplate.design]); // Depend on initialTemplate fields

  useEffect(() => {
    if (isClient && staffCardProfile.name) {
      const cardIdentifier = sanitizeForUrl(staffCardProfile.name);
      const newQrCodeUrl = `${window.location.origin}/card/${cardIdentifier}-preview`;
      setCardDesign(prev => {
        if (prev.qrCodeUrl !== newQrCodeUrl) {
          return { ...prev, qrCodeUrl: newQrCodeUrl };
        }
        return prev;
      });
    } else if (isClient && !staffCardProfile.name) {
        setCardDesign(prev => ({ ...prev, qrCodeUrl: '' }));
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


  if (!isClient) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-grow px-0 py-0">
          <Card className="mb-6 shadow-none border-0 rounded-none">
            <CardHeader className="pb-2 pt-0 px-0">
                <CardTitle className="flex items-center text-xl"><Blocks className="mr-2 h-5 w-5 text-primary"/>Digital Card Editor</CardTitle>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background">
      <main className="flex-grow px-0 py-0">
        
        <Card className="mb-6 shadow-none border-0 rounded-none">
          <CardHeader className="pb-2 pt-0 px-0">
              <CardTitle className="flex items-center text-xl"><Blocks className="mr-2 h-5 w-5 text-primary"/>Digital Card Editor</CardTitle>
              <CardDescription>Design and customize a digital business card. This data will be used when adding new staff or creating templates.</CardDescription>
          </CardHeader>
        </Card>

        {/* 
          Future: If a template picker is desired again, it could be re-added here:
          <TemplatePicker 
            templates={APP_TEMPLATES} 
            currentTemplateId={cardDesign.template} 
            onTemplateSelect={(templateId) => {
              const selected = APP_TEMPLATES.find(t => t.id === templateId);
              if (selected) {
                setStaffCardProfile(selected.profile);
                setCardDesign(selected.design);
              }
            }} 
          /> 
        */}

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
            {staffCardProfile.name && cardDesign.qrCodeUrl && <ShareCard cardUrl={cardDesign.qrCodeUrl} />}
          </div>
        </div>
      </main>
    </div>
  );
}
