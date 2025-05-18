
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { UserProfileForm } from '@/components/UserProfileForm';
import { CardPreview } from '@/components/CardPreview';
import type { StaffCardData, CardDesignSettings, AppTemplate } from '@/lib/app-types';
import { APP_TEMPLATES, defaultStaffCardData, defaultCardDesignSettings } from '@/lib/app-types';
import { sanitizeForUrl } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Blocks } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplatePicker } from '@/components/TemplatePicker';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

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
  const { currentUser } = useAuth(); // Get current user for default info
  const initialTemplate = APP_TEMPLATES.length > 0 ? APP_TEMPLATES[0] : { id: 'default', name: 'Default', description: 'Default starting point', profile: defaultStaffCardData, design: defaultCardDesignSettings };

  const [staffCardProfile, setStaffCardProfile] = useState<StaffCardData>(() => {
    // Initialize with current user's info if available, otherwise template's default
    if (currentUser) {
      return {
        ...initialTemplate.profile, // Start with template structure
        name: currentUser.displayName || currentUser.email || initialTemplate.profile.name,
        email: currentUser.email || initialTemplate.profile.email,
        // companyName could come from currentUser.adminProfile?.companyName if available
        companyName: currentUser.adminProfile?.companyName || initialTemplate.profile.companyName,
        profilePictureUrl: currentUser.photoURL || initialTemplate.profile.profilePictureUrl,
      };
    }
    return initialTemplate.profile;
  });

  const [cardDesign, setCardDesign] = useState<CardDesignSettings>(initialTemplate.design);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(initialTemplate.id);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // This effect ensures that when the component mounts or currentUser changes,
  // the profile defaults are set correctly, prioritizing user data.
  useEffect(() => {
    if (isClient) {
      const selectedTemplate = APP_TEMPLATES.find(t => t.id === currentTemplateId) || initialTemplate;
      setStaffCardProfile(prevProfile => ({
        ...selectedTemplate.profile, // Base template profile
        name: currentUser?.displayName || currentUser?.email || prevProfile.name || selectedTemplate.profile.name,
        email: currentUser?.email || prevProfile.email || selectedTemplate.profile.email,
        companyName: currentUser?.adminProfile?.companyName || prevProfile.companyName || selectedTemplate.profile.companyName,
        profilePictureUrl: currentUser?.photoURL || prevProfile.profilePictureUrl || selectedTemplate.profile.profilePictureUrl,
        cardBackgroundUrl: prevProfile.cardBackgroundUrl || selectedTemplate.profile.cardBackgroundUrl, // Preserve user-uploaded background if it exists
        // Preserve other fields if they were manually entered by the user
        phone: prevProfile.phone || selectedTemplate.profile.phone,
        title: prevProfile.title || selectedTemplate.profile.title,
        website: prevProfile.website || selectedTemplate.profile.website,
        linkedin: prevProfile.linkedin || selectedTemplate.profile.linkedin,
        twitter: prevProfile.twitter || selectedTemplate.profile.twitter,
        github: prevProfile.github || selectedTemplate.profile.github,
        address: prevProfile.address || selectedTemplate.profile.address,
        userInfo: prevProfile.userInfo || selectedTemplate.profile.userInfo,
        targetAudience: prevProfile.targetAudience || selectedTemplate.profile.targetAudience,
      }));
      setCardDesign(selectedTemplate.design);
    }
  }, [currentTemplateId, initialTemplate, currentUser, isClient]);


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
        const topLevelKeys = ['template', 'layout', 'qrCodeUrl', 'aiHint'] as const;
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
      return { 
        ...prev, 
        layout: suggestedDesign.layout || prev.layout, 
        colorScheme: finalColorScheme,
        aiHint: suggestedDesign.aiHint || prev.aiHint,
      };
    });
  }, []);

  const handleUpdateProfileForAI = useCallback((aiData: Partial<StaffCardData>) => { 
    handleProfileChange(aiData);
  }, [handleProfileChange]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    const selectedTemplate = APP_TEMPLATES.find(t => t.id === templateId);
    if (selectedTemplate) {
      setCurrentTemplateId(templateId); // This will trigger the useEffect to update states
      
      // Apply template design directly
      setCardDesign(selectedTemplate.design);

      // Merge profile data, prioritizing existing user data for key fields
      setStaffCardProfile(prevProfile => {
        const newProfile = { ...prevProfile }; // Start with current user data

        // Fields to take from template if current is empty or placeholder-like
        const templateDefaultsFields: (keyof StaffCardData)[] = [
          'title', 'companyName', 'companyLogoUrl', 'website', 'linkedin', 
          'twitter', 'github', 'address', 'userInfo', 'targetAudience'
        ];
        
        templateDefaultsFields.forEach(field => {
          if (!newProfile[field] || (typeof newProfile[field] === 'string' && (newProfile[field] as string).startsWith('https://placehold.co'))) {
            newProfile[field] = selectedTemplate.profile[field];
          }
        });

        // Handle images separately: if user has not uploaded, use template's
        if (!prevProfile.profilePictureUrl || prevProfile.profilePictureUrl.startsWith('https://placehold.co')) {
          newProfile.profilePictureUrl = selectedTemplate.profile.profilePictureUrl;
        }
        if (!prevProfile.cardBackgroundUrl || prevProfile.cardBackgroundUrl.startsWith('https://placehold.co')) {
          newProfile.cardBackgroundUrl = selectedTemplate.profile.cardBackgroundUrl;
        }
        
        // Ensure core identity from currentUser (if available) is prioritized if not already set from initial load
        if (currentUser) {
            newProfile.name = prevProfile.name || currentUser.displayName || currentUser.email || selectedTemplate.profile.name;
            newProfile.email = prevProfile.email || currentUser.email || selectedTemplate.profile.email;
            if (!prevProfile.companyName && currentUser.adminProfile?.companyName) {
                newProfile.companyName = currentUser.adminProfile.companyName;
            }
            if (!prevProfile.profilePictureUrl && currentUser.photoURL) {
                newProfile.profilePictureUrl = currentUser.photoURL;
            }
        }


        return newProfile;
      });
    }
  }, [currentUser]);


  if (!isClient) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-grow px-0 py-0">
          <Card className="mb-6 shadow-none border-0 rounded-none">
            <CardHeader className="pb-2 pt-0 px-0">
                <CardTitle className="flex items-center text-xl"><Blocks className="mr-2 h-5 w-5 text-primary"/>Digital Card Editor</CardTitle>
                <CardDescription>Design and customize digital business cards. This data will be used when adding new staff or creating templates.</CardDescription>
            </CardHeader>
          </Card>
          <Skeleton className="h-[80px] w-full rounded-lg mb-8" /> 
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
              <CardDescription>Design and customize a digital business card. Select a template to get started, then personalize the details.</CardDescription>
          </CardHeader>
        </Card>

        <TemplatePicker 
            templates={APP_TEMPLATES} 
            currentTemplateId={currentTemplateId} 
            onTemplateSelect={handleTemplateSelect}
        /> 

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">
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

