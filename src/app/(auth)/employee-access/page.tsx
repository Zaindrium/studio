
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KeySquare, UserCircle, Mail, Phone, Globe, Linkedin, Twitter, Github, MapPin, Building, Info, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StaffCardData } from '@/lib/app-types';
import { defaultStaffCardData } from '@/lib/app-types'; // For form defaults

const MOCK_VALID_ACCESS_CODE = "STAFF123"; // For simulation

export default function EmployeeAccessPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [accessCode, setAccessCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffCardData>>(defaultStaffCardData);
  const [staffEmailForDisplay, setStaffEmailForDisplay] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);


  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast({
      title: "Verifying Access Code...",
      description: "Please wait.",
    });

    // Simulate API call for code verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (accessCode === MOCK_VALID_ACCESS_CODE) {
      toast({
        title: "Code Verified!",
        description: "Please fill in or update your card details below.",
        variant: "default",
      });
      // In a real app, you'd fetch existing data for this staff member using the code/token
      // For simulation, we'll assume they are filling it for the first time or updating.
      // We can pre-fill the email based on a conceptual lookup from the access code.
      const mockFetchedEmail = "staff.member@example.com"; // Placeholder
      setStaffEmailForDisplay(mockFetchedEmail);
      setFormData(prev => ({ ...prev, email: mockFetchedEmail }));
      setIsCodeVerified(true);
    } else {
      toast({
        title: "Verification Failed",
        description: "Invalid access code. Please check and try again, or contact your administrator.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (field: keyof StaffCardData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast({
      title: "Submitting Your Details...",
      description: "Please wait.",
    });

    // Simulate API call to save staff details
    console.log("Submitting staff details:", formData);
    // In a real app, this would be an API call to a backend/Cloud Function that:
    // 1. Validates the access code/token again.
    // 2. Updates the StaffRecord in Firestore with the new cardDisplayData.
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Details Submitted!",
      description: "Your digital business card information has been updated. Thank you!",
      variant: "default",
    });
    setIsSubmitted(true); // Show a thank you message, no further actions on this page
    // Optionally, could redirect to a generic "thank you" page or just display the message.
    // For now, we'll keep them on the page with a success state.
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <CardTitle className="text-2xl">Details Submitted Successfully!</CardTitle>
              <CardDescription>
                Your digital business card information has been updated.
                Your administrator can now see these changes. No further action is needed from your side.
              </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={() => router.push('/login')} className="w-full">
                    Return to LinkUP
                </Button>
            </CardFooter>
          </Card>
       </div>
    );
  }


  if (!isCodeVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <KeySquare className="mr-2 h-6 w-6 text-primary" /> Staff Detail Submission
            </CardTitle>
            <CardDescription>
              Enter the access code provided by your administrator to submit or update your business card details. (Hint: try "{MOCK_VALID_ACCESS_CODE}")
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerifyCode}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="flex items-center"><KeySquare className="mr-2 h-4 w-4 text-primary"/>Access Code</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Your unique access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Lost your code or link? Contact your administrator.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Form to fill in card details
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
            <UserCircle className="mr-2 h-6 w-6 text-primary" /> Your Business Card Details
            </CardTitle>
            <CardDescription>
            Please fill in or update your information for your digital business card. This will be visible to others when your card is shared.
            {staffEmailForDisplay && <p className="mt-1 font-medium">Email (from invite): {staffEmailForDisplay}</p>}
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitDetails}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="staffName" className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-primary"/>Full Name *</Label>
                    <Input id="staffName" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} placeholder="Your Full Name" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staffTitle" className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary"/>Job Title *</Label>
                    <Input id="staffTitle" value={formData.title || ''} onChange={e => handleInputChange('title', e.target.value)} placeholder="Your Job Title" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="staffCompanyName" className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary"/>Company Name (Optional)</Label>
                    <Input id="staffCompanyName" value={formData.companyName || ''} onChange={e => handleInputChange('companyName', e.target.value)} placeholder="Company Name" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staffEmail" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary"/>Email *</Label>
                    <Input id="staffEmail" type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} placeholder="your.email@example.com" required disabled={!!staffEmailForDisplay} />
                     {staffEmailForDisplay && <p className="text-xs text-muted-foreground">Your email is pre-filled from the invite.</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staffPhone" className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary"/>Phone (Optional)</Label>
                    <Input id="staffPhone" type="tel" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} placeholder="Your Phone Number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staffWebsite" className="flex items-center"><Globe className="mr-2 h-4 w-4 text-primary"/>Website (Optional)</Label>
                    <Input id="staffWebsite" type="url" value={formData.website || ''} onChange={e => handleInputChange('website', e.target.value)} placeholder="https://yourwebsite.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staffLinkedin" className="flex items-center"><Linkedin className="mr-2 h-4 w-4 text-primary"/>LinkedIn Profile URL (Optional)</Label>
                    <Input id="staffLinkedin" value={formData.linkedin || ''} onChange={e => handleInputChange('linkedin', e.target.value)} placeholder="linkedin.com/in/yourprofile" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staffTwitter" className="flex items-center"><Twitter className="mr-2 h-4 w-4 text-primary"/>Twitter Handle (Optional)</Label>
                    <Input id="staffTwitter" value={formData.twitter || ''} onChange={e => handleInputChange('twitter', e.target.value)} placeholder="@yourhandle" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="staffGithub" className="flex items-center"><Github className="mr-2 h-4 w-4 text-primary"/>GitHub Username (Optional)</Label>
                    <Input id="staffGithub" value={formData.github || ''} onChange={e => handleInputChange('github', e.target.value)} placeholder="yourusername" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="staffAddress" className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary"/>Address (Optional)</Label>
                    <Input id="staffAddress" value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} placeholder="Your Full Address" />
                </div>
            </div>
             <div className="space-y-2 pt-2">
                <Label htmlFor="staffUserInfo" className="flex items-center"><Info className="mr-2 h-4 w-4 text-primary"/>Short Bio / About Me (Optional)</Label>
                <Textarea id="staffUserInfo" value={formData.userInfo || ''} onChange={e => handleInputChange('userInfo', e.target.value)} placeholder="A brief description about you or your role (max 200 characters)." maxLength={200} rows={3} />
            </div>
            {/* Profile picture and background URL upload would ideally be here, but are complex for this simulation. Admins can set these. */}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 border-t pt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
                <Save className="mr-2 h-5 w-5" />
                {isLoading ? 'Submitting Details...' : 'Submit My Card Details'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
                Your details will be used to create/update your digital business card.
                If you need to make changes later, please contact your administrator to request an update link.
            </p>
            </CardFooter>
        </form>
        </Card>
    </div>
  );
}


    