
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { UserProfileForm } from '@/components/UserProfileForm';
import { CardPreview } from '@/components/CardPreview';
import type { StaffCardData, CardDesignSettings, AppPlan } from '@/lib/app-types';
import { APP_TEMPLATES, defaultStaffCardData, defaultCardDesignSettings } from '@/lib/app-types';
import { sanitizeForUrl } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Blocks, Save, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplatePicker } from '@/components/TemplatePicker';
import { useAuth } from '@/contexts/auth-context';
import { db, storage } from '@/lib/firebase'; // Import storage
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage'; // Import storage functions
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const CardDesigner = dynamic(() => import('@/components/CardDesigner').then(mod => mod.CardDesigner), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});
const AiDesignAssistant = dynamic(() => import('@/components/AiDesignAssistant').then(mod => mod.AiDesignAssistant), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
});
const ShareCard = dynamic(() => import('@/components/ShareCard').then(mod => mod.ShareCard), {
  loading: () => <Skeleton className="h-[200px] w-full rounded-lg" />,
});

interface NewStaffDialogFormState {
  name: string;
  email: string;
}

// Helper function to upload image if it's a data URL
async function uploadImageAndGetURL(companyId: string, imagePath: string, dataUrl: string): Promise<string> {
  if (dataUrl.startsWith('data:')) {
    const storageRef = ref(storage, `companies/${companyId}/${imagePath}`);
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
    return await getDownloadURL(snapshot.ref);
  }
  return dataUrl; // Return original URL if not a data URL
}

export default function GeneratorPage() {
  const { currentUser, companyId, fetchAndCacheStaff } = useAuth();
  const { toast } = useToast();

  const [staffCardProfile, setStaffCardProfile] = useState<StaffCardData>(() => {
    const initialProfile = { ...defaultStaffCardData };
    if (currentUser) {
      initialProfile.name = currentUser.displayName || currentUser.email || defaultStaffCardData.name;
      initialProfile.email = currentUser.email || defaultStaffCardData.email;
      initialProfile.companyName = currentUser.adminProfile?.companyName || defaultStaffCardData.companyName;
      initialProfile.profilePictureUrl = currentUser.photoURL || defaultStaffCardData.profilePictureUrl;
    }
    return initialProfile;
  });

  const [cardDesign, setCardDesign] = useState<CardDesignSettings>(defaultCardDesignSettings);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(APP_TEMPLATES[0]?.id || 'tech-innovator');
  const [isClient, setIsClient] = useState(false);
  const [isSaveStaffDialogOpen, setIsSaveStaffDialogOpen] = useState(false);
  const [newStaffDialogForm, setNewStaffDialogForm] = useState<NewStaffDialogFormState>({ name: '', email: ''});
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      const selectedTemplate = APP_TEMPLATES.find(t => t.id === currentTemplateId) || APP_TEMPLATES[0];
      if (selectedTemplate) {
        setStaffCardProfile(prevProfile => {
          const newProfile: StaffCardData = {
            name: currentUser?.displayName || currentUser?.email || prevProfile.name || selectedTemplate.profile.name,
            title: prevProfile.title || selectedTemplate.profile.title,
            companyName: currentUser?.adminProfile?.companyName || prevProfile.companyName || selectedTemplate.profile.companyName,
            phone: prevProfile.phone || selectedTemplate.profile.phone,
            email: currentUser?.email || prevProfile.email || selectedTemplate.profile.email,
            website: prevProfile.website || selectedTemplate.profile.website,
            linkedin: prevProfile.linkedin || selectedTemplate.profile.linkedin,
            address: prevProfile.address || selectedTemplate.profile.address,
            profilePictureUrl: prevProfile.profilePictureUrl && !prevProfile.profilePictureUrl.startsWith('https://placehold.co') ? prevProfile.profilePictureUrl : currentUser?.photoURL || selectedTemplate.profile.profilePictureUrl,
            cardBackgroundUrl: prevProfile.cardBackgroundUrl && !prevProfile.cardBackgroundUrl.startsWith('https://placehold.co') ? prevProfile.cardBackgroundUrl : selectedTemplate.profile.cardBackgroundUrl,
            userInfo: prevProfile.userInfo || selectedTemplate.profile.userInfo,
            targetAudience: prevProfile.targetAudience || selectedTemplate.profile.targetAudience,
          };
          return newProfile;
        });
        setCardDesign(selectedTemplate.design);
      }
    }
  }, [currentTemplateId, currentUser, isClient]);

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
    setStaffCardProfile(currentProfile => ({ ...currentProfile, ...newProfileData }));
  }, []);

  const handleDesignChange = useCallback((newDesignData: Partial<CardDesignSettings>) => {
    setCardDesign(currentDesign => ({ ...currentDesign, ...newDesignData }));
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
    setCurrentTemplateId(templateId);
  }, []); 

  const openSaveStaffDialog = () => {
    setNewStaffDialogForm({
      name: staffCardProfile.name || '',
      email: staffCardProfile.email || '',
    });
    setIsSaveStaffDialogOpen(true);
  };

  const handleDialogFormChange = (field: keyof NewStaffDialogFormState, value: string) => {
    setNewStaffDialogForm(prev => ({...prev, [field]: value}));
  };

  const handleSaveNewStaffCard = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!companyId || !currentUser) {
      toast({ title: "Error", description: "User or Company context not available. Cannot save staff card.", variant: "destructive" });
      return;
    }
    if (!newStaffDialogForm.name.trim() || !newStaffDialogForm.email.trim()) {
      toast({ title: "Missing Information", description: "Please provide a Name and Email for the new staff member.", variant: "destructive" });
      return;
    }
    setIsSavingStaff(true);
    let finalProfilePicUrl = staffCardProfile.profilePictureUrl;
    let finalBackgroundUrl = staffCardProfile.cardBackgroundUrl;

    try {
      if (finalProfilePicUrl && finalProfilePicUrl.startsWith('data:')) {
        const imagePath = `staff_images/${currentUser.uid}_${Date.now()}_profile.png`;
        finalProfilePicUrl = await uploadImageAndGetURL(companyId, imagePath, finalProfilePicUrl);
      }

      if (finalBackgroundUrl && finalBackgroundUrl.startsWith('data:')) {
        const imagePath = `staff_images/${currentUser.uid}_${Date.now()}_background.png`;
        finalBackgroundUrl = await uploadImageAndGetURL(companyId, imagePath, finalBackgroundUrl);
      }

      const staffCollectionRef = collection(db, `companies/${companyId}/staff`);
      const updatedStaffCardProfile = {
        ...staffCardProfile,
        name: newStaffDialogForm.name, 
        email: newStaffDialogForm.email,
        profilePictureUrl: finalProfilePicUrl,
        cardBackgroundUrl: finalBackgroundUrl,
      };

      const newStaffRecord = {
        name: newStaffDialogForm.name,
        email: newStaffDialogForm.email,
        role: updatedStaffCardProfile.title ? (updatedStaffCardProfile.title.toLowerCase().includes('manager') ? 'Manager' : 'Employee') : 'Employee',
        status: 'Active',
        fingerprintUrl: sanitizeForUrl(`staff-${newStaffDialogForm.name}-${Date.now().toString(36)}`),
        cardDisplayData: updatedStaffCardProfile,
        designSettings: cardDesign,
        cardsCreatedCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: null,
      };
      await addDoc(staffCollectionRef, newStaffRecord);
      toast({ title: "Success!", description: `New staff card for ${newStaffDialogForm.name} saved.`});
      await fetchAndCacheStaff(companyId); 
      setIsSaveStaffDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving new staff card:", error);
       if (error.code === 'permission-denied' || error.code?.includes('storage/unauthorized')) {
        toast({ title: "Permission Denied", description: "You do not have permission to save card data or upload images. Check Firestore/Storage rules.", variant: "destructive", duration: 7000 });
      } else {
        toast({ title: "Error Saving Card", description: `Could not save card: ${error.message || 'Unknown error'}`, variant: "destructive" });
      }
    } finally {
      setIsSavingStaff(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-grow px-0 py-0">
          <Card className="mb-6 shadow-none border-0 rounded-none">
            <CardHeader className="pb-2 pt-0 px-0">
                <CardTitle className="flex items-center text-xl"><Blocks className="mr-2 h-5 w-5 text-primary"/>Digital Card Editor</CardTitle>
                <CardDescription>Design and customize digital business cards. This editor provides a live preview. To create or update a card for a specific staff member, go to the "Staff" section.</CardDescription>
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
              <CardDescription>Design and customize a digital business card. Select a template to get started, then personalize the details. Use "Save as New Staff Card" to persist your design to a new staff member.</CardDescription>
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
             <Button onClick={openSaveStaffDialog} className="w-full" disabled={!companyId || isSavingStaff}>
              <Save className="mr-2 h-5 w-5" /> Save as New Staff Card
            </Button>
          </div>
        </div>
      </main>
      
      <Dialog open={isSaveStaffDialogOpen} onOpenChange={setIsSaveStaffDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Card to New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the name and email for the new staff member who will be assigned this card design.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewStaffCard}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="staffName">Staff Member's Full Name</Label>
                <Input
                  id="staffName"
                  value={newStaffDialogForm.name}
                  onChange={(e) => handleDialogFormChange('name', e.target.value)}
                  placeholder="e.g., Jane Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffEmail">Staff Member's Email</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  value={newStaffDialogForm.email} 
                  onChange={(e) => handleDialogFormChange('email', e.target.value)}
                  placeholder="e.g., jane.smith@example.com"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSavingStaff}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSavingStaff}>
                {isSavingStaff ? 'Saving...' : <><UserPlus className="mr-2 h-4 w-4"/> Create Staff & Save Card</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
