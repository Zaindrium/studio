
"use client";

import type { StaffCardData } from '@/lib/app-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Phone, Mail, Globe, Linkedin, MapPin, Info, Users, ImageIcon, UploadCloud, Trash2, Crop, Type, Star, Shield, Languages, GripVertical } from 'lucide-react'; // Added Type, Star, Shield, Languages, GripVertical
import React, { useRef, memo } from 'react';

const staffCardSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  preferredName: z.string().optional(),
  maidenName: z.string().optional(),
  pronouns: z.string().optional(),
  accreditations: z.string().optional(),
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  companyName: z.string().optional(), 
  phone: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  website: z.string().url({ message: 'Invalid URL.' }).optional().or(z.literal('')),
  linkedin: z.string().optional(),
  address: z.string().optional(),
  profilePictureUrl: z.string().optional().or(z.literal('')),
  cardBackgroundUrl: z.string().optional().or(z.literal('')), // Kept for direct URL input if needed, though UI focuses on upload
  companyLogoUrl: z.string().optional().or(z.literal('')), // Added for consistency with StaffCardData
  userInfo: z.string().optional().describe('Information about the user for AI assistant.'),
  targetAudience: z.string().optional().describe('The target audience for the business card for AI assistant.'),
});

type StaffCardFormValues = z.infer<typeof staffCardSchema>;

interface UserProfileFormProps {
  profile: StaffCardData; 
  onProfileChange: (data: Partial<StaffCardData>) => void; 
}

const UserProfileFormComponent = ({ profile, onProfileChange }: UserProfileFormProps) => {
  const form = useForm<StaffCardFormValues>({
    resolver: zodResolver(staffCardSchema),
    defaultValues: profile,
  });

  // Removed profilePictureInputRef as it's now handled in the "Display" tab
  // Removed cardBackgroundInputRef as it's now handled in the "Display" tab or by AI

  React.useEffect(() => {
    form.reset(profile);
  }, [profile, form]);

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onProfileChange(value as Partial<StaffCardData>); 
    });
    return () => subscription.unsubscribe();
  }, [form, onProfileChange]);

  // handleFileChange is removed as file uploads are now in the "Display" tab

  return (
    <Card className="shadow-none border-0 rounded-none bg-transparent">
      {/* CardHeader removed for cleaner integration into tab */}
      <CardContent className="p-0"> {/* Removed padding from CardContent to match mockup's tighter field spacing */}
        <Form {...form}>
          <form className="space-y-4"> {/* Reduced space-y for tighter packing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Reduced gap */}
              <FormField
                control={form.control}
                name="prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><GripVertical className="mr-2 h-4 w-4 text-primary" />Prefix</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mr., Ms., Dr." {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><User className="mr-2 h-4 w-4 text-primary" />Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="suffix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><GripVertical className="mr-2 h-4 w-4 text-primary" />Suffix</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jr., PhD, Esq." {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><User className="mr-2 h-4 w-4 text-primary" />Preferred Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Johnny" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maidenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><User className="mr-2 h-4 w-4 text-primary" />Maiden Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Smith (Maiden)" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pronouns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><Languages className="mr-2 h-4 w-4 text-primary" />Pronouns (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. she/her, they/them" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="accreditations"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center text-sm"><Star className="mr-2 h-4 w-4 text-primary" />Accreditations (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PhD, MBA, CFP®" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><Briefcase className="mr-2 h-4 w-4 text-primary" />Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><Briefcase className="mr-2 h-4 w-4 text-primary" />Company Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Innovatech" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><Mail className="mr-2 h-4 w-4 text-primary" />Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john.doe@example.com" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><Phone className="mr-2 h-4 w-4 text-primary" />Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g. +1 555-1234" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><Globe className="mr-2 h-4 w-4 text-primary" />Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. https://johndoe.dev" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-sm"><Linkedin className="mr-2 h-4 w-4 text-primary" />LinkedIn Profile URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. linkedin.com/in/johndoe" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2"> {/* Address can span two columns */}
                    <FormLabel className="flex items-center text-sm"><MapPin className="mr-2 h-4 w-4 text-primary" />Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Tech Street, Silicon Valley" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* AI Assistant Related Fields - Kept separate for clarity */}
            <div className="pt-4 border-t mt-4 border-gray-700">
              <h3 className="text-base font-semibold mb-3 flex items-center text-muted-foreground"><Info className="mr-2 h-5 w-5 text-accent" />For AI Design Assistant (Optional)</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="userInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm"><User className="mr-2 h-4 w-4 text-primary" />Staff Info (Profession, Interests)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. UI/UX designer passionate about accessibility and minimalist design." {...field} className="text-sm" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm"><Users className="mr-2 h-4 w-4 text-primary" />Target Audience for Card</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Potential employers, freelance clients, design community peers." {...field} className="text-sm" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export const UserProfileForm = memo(UserProfileFormComponent);
