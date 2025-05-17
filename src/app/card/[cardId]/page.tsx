
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CardPreview } from '@/components/CardPreview';
// appTemplates removed as we're moving away from mock data
import type { StaffRecord, StaffCardData, CardDesignSettings, ContactInfo } from '@/lib/app-types';
import { defaultStaffCardData, defaultCardDesignSettings } from '@/lib/app-types'; // Import defaults
import { sanitizeForUrl, ensureHttps } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquarePlus } from 'lucide-react';
import { db } from '@/lib/firebase'; // Import db
import { collection, query, where, getDocs, limit } from 'firebase/firestore'; // Import Firestore functions
import { useAuth } from '@/contexts/auth-context'; // To potentially get companyId if admin is viewing

const CONTACTS_STORAGE_KEY = 'linkup_collected_contacts';

export default function PublicCardPage() {
  const params = useParams();
  const cardIdFromUrl = typeof params.cardId === 'string' ? params.cardId : ''; // This is the fingerprintUrl
  const { toast } = useToast();
  const { companyId: loggedInAdminCompanyId } = useAuth(); // Get companyId if an admin is logged in

  const [profile, setProfile] = useState<StaffCardData | null>(null);
  const [design, setDesign] = useState<CardDesignSettings | null>(null);
  const [cardOwnerName, setCardOwnerName] = useState<string>('the card owner'); // For dialogs
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!cardIdFromUrl) {
        setError('No card ID provided in the URL.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        // For this to work publicly without knowing the companyId, you'd typically:
        // 1. Have a top-level collection `publicCards` where doc ID = fingerprintUrl.
        // 2. Or, use a Cloud Function backend endpoint that can query across companies (less efficient).
        // For now, we'll simulate by trying to find it in the logged-in admin's company,
        // or use a placeholder/demo company if no admin is logged in and it's a public view.
        // THIS IS A SIMPLIFIED APPROACH FOR THE REFACTOR and not a robust public solution.

        let foundStaffRecord: StaffRecord | null = null;
        
        // Attempt to find the staff record. This query is inefficient for a truly public page.
        // In a real app, you would have a direct way to fetch a card by its public ID.
        const companiesCollectionRef = collection(db, 'companies');
        const companiesSnapshot = await getDocs(companiesCollectionRef);

        for (const companyDoc of companiesSnapshot.docs) {
          const staffCollectionRef = collection(db, `companies/${companyDoc.id}/staff`);
          const staffQuery = query(staffCollectionRef, where("fingerprintUrl", "==", cardIdFromUrl), limit(1));
          const staffSnapshot = await getDocs(staffQuery);

          if (!staffSnapshot.empty) {
            foundStaffRecord = { id: staffSnapshot.docs[0].id, ...staffSnapshot.docs[0].data() } as StaffRecord;
            break; // Found the card
          }
        }

        if (foundStaffRecord && foundStaffRecord.cardDisplayData && foundStaffRecord.designSettings) {
          setProfile(foundStaffRecord.cardDisplayData);
          setCardOwnerName(foundStaffRecord.cardDisplayData.name || 'the card owner');
          setDesign({
            ...foundStaffRecord.designSettings,
            qrCodeUrl: typeof window !== "undefined" ? window.location.href : '', 
          });
        } else {
          setError('Card not found. The link may be incorrect or the card may have been removed.');
        }
      } catch (e) {
        console.error("Error fetching public card data:", e);
        setError('Could not load card data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, [cardIdFromUrl, loggedInAdminCompanyId]); // loggedInAdminCompanyId is illustrative here for demo

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
    if (profile.companyName) vcfContent += `ORG:${profile.companyName}\n`; // Use companyName from StaffCardData
    if (profile.phone) vcfContent += `TEL;TYPE=WORK,VOICE:${profile.phone}\n`;
    if (profile.email) vcfContent += `EMAIL:${profile.email}\n`;
    if (profile.website) vcfContent += `URL:${ensureHttps(profile.website)}\n`;
    if (profile.address) vcfContent += `ADR;TYPE=WORK:;;${profile.address};;;;\n`; 
    
    if (profile.linkedin) vcfContent += `X-SOCIALPROFILE;TYPE=linkedin:${ensureHttps(profile.linkedin)}\n`;
    if (profile.twitter) vcfContent += `X-SOCIALPROFILE;TYPE=twitter:${ensureHttps(profile.twitter.startsWith('@') ? `https://twitter.com/${profile.twitter.substring(1)}` : profile.twitter)}\n`;
    if (profile.github) vcfContent += `X-SOCIALPROFILE;TYPE=github:${ensureHttps(profile.github.includes('/') ? profile.github : `https://github.com/${profile.github}`)}\n`;
    
    if (profile.profilePictureUrl && !profile.profilePictureUrl.startsWith('data:') && !profile.profilePictureUrl.startsWith('https://placehold.co')) {
         vcfContent += `PHOTO;VALUE=URL:${profile.profilePictureUrl}\n`;
     }

    if (profile.userInfo) vcfContent += `NOTE:About Staff: ${profile.userInfo.replace(/\n/g, '\\n')}\n`; // Changed from "About Me"

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

  const handleSubmitContactForm = (event: React.FormEvent) => {
    event.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least your name and email.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmittingContact(true);

    const newContact: ContactInfo = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: contactName,
      email: contactEmail,
      phone: contactPhone || undefined,
      company: contactCompany || undefined,
      message: contactMessage || undefined,
      submittedFromCardId: cardIdFromUrl,
      submittedAt: new Date().toISOString(),
    };

    try {
      const existingContactsRaw = localStorage.getItem(CONTACTS_STORAGE_KEY);
      const existingContacts: ContactInfo[] = existingContactsRaw ? JSON.parse(existingContactsRaw) : [];
      existingContacts.push(newContact);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(existingContacts));

      toast({
        title: "Details Sent!",
        description: `Thank you, ${contactName}! Your information has been shared with ${cardOwnerName}.`,
      });
      setIsContactDialogOpen(false);
      // Reset form
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactCompany('');
      setContactMessage('');
    } catch (e) {
      console.error("Error saving contact to localStorage:", e);
      toast({
        title: "Submission Error",
        description: "Could not save your details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-background">
        <Skeleton className="w-full max-w-sm h-[calc(100vw_*_16/9)] sm:h-[650px] rounded-lg shadow-xl" />
        <p className="mt-4 text-muted-foreground">Loading card...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 text-center bg-background">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Error</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
        <Link href="/login" className="mt-6 text-primary hover:underline">Go to Login</Link>
      </div>
    );
  }

  if (profile && design) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background p-2 sm:p-4">
        <CardPreview 
            profile={profile} 
            design={design} 
            isPublicView={true}
            onSaveContact={handleSaveContact} 
        />
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogTrigger asChild>
             <Button 
                variant="default" 
                className="mt-4 py-3 px-6 text-base fixed bottom-20 left-1/2 -translate-x-1/2 sm:static sm:bottom-auto sm:left-auto sm:-translate-x-0"
                style={{
                    backgroundColor: design.colorScheme.primaryColor, 
                    color: design.colorScheme.cardBackground // Ensure contrast
                }}
             >
                <MessageSquarePlus className="mr-2 h-5 w-5" /> Connect with {cardOwnerName}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect with {cardOwnerName}</DialogTitle>
              <DialogDescription>
                Leave your details, and {cardOwnerName} can get in touch with you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitContactForm}>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="contact-name">Full Name *</Label>
                  <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your Name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your.email@example.com" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-phone">Phone (Optional)</Label>
                  <Input id="contact-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Your Phone Number" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-company">Company (Optional)</Label>
                  <Input id="contact-company" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} placeholder="Your Company Name" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-message">Message (Optional)</Label>
                  <Textarea id="contact-message" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Leave a short message..." />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmittingContact}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmittingContact}>
                  {isSubmittingContact ? 'Sending...' : 'Send Details'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 text-center bg-background">
        <p className="text-lg text-muted-foreground">Could not load card data. The card may not exist or the link is incorrect.</p>
         <Link href="/login" className="mt-6 text-primary hover:underline">Go to Login</Link>
    </div>
  );
}
