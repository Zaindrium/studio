
"use client";

import type { UserProfile } from '@/lib/types';
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
import { Button } from '@/components/ui/button'; // Added Button
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Phone, Mail, Globe, Linkedin, Twitter, Github, MapPin, Info, Users, Image as ImageIcon, ImagePlus, UploadCloud } from 'lucide-react'; // Added UploadCloud
import React, { useRef } from 'react'; // Added useRef

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  website: z.string().url({ message: 'Invalid URL.' }).optional().or(z.literal('')),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  address: z.string().optional(),
  profilePictureUrl: z.string().optional().or(z.literal('')), // Accepts URL or dataURI
  cardBackgroundUrl: z.string().optional().or(z.literal('')), // Accepts URL or dataURI
  userInfo: z.string().optional().describe('Information about the user, including their profession and interests for AI assistant.'),
  targetAudience: z.string().optional().describe('The target audience for the business card for AI assistant.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  profile: UserProfile;
  onProfileChange: (data: Partial<UserProfile>) => void; // Changed to Partial<UserProfile>
}

export function UserProfileForm({ profile, onProfileChange }: UserProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const cardBackgroundInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    form.reset(profile);
  }, [profile, form]);

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onProfileChange(value as UserProfile);
    });
    return () => subscription.unsubscribe();
  }, [form, onProfileChange]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof ProfileFormValues
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(fieldName, reader.result as string);
        // onProfileChange({ [fieldName]: reader.result as string }); // This will be handled by the watch effect
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><User className="mr-2 h-6 w-6 text-primary" /> Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4" />Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
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
                    <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4" />Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4" />Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Innovatech" {...field} />
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
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4" />Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g. john.doe@example.com" {...field} />
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
                    <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4" />Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g. +1 555-1234" {...field} />
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
                    <FormLabel className="flex items-center"><Globe className="mr-2 h-4 w-4" />Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. https://johndoe.dev" {...field} />
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
                    <FormLabel className="flex items-center"><Linkedin className="mr-2 h-4 w-4" />LinkedIn Profile URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. linkedin.com/in/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Twitter className="mr-2 h-4 w-4" />Twitter Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. @johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Github className="mr-2 h-4 w-4" />GitHub Username (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4" />Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123 Tech Street, Silicon Valley" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profilePictureUrl"
              render={() => ( // field is not directly used here for the button case
                <FormItem>
                  <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4" />Profile Picture</FormLabel>
                  <FormControl>
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={profilePictureInputRef}
                        onChange={(e) => handleFileChange(e, 'profilePictureUrl')}
                        className="hidden"
                        data-ai-hint="person portrait"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => profilePictureInputRef.current?.click()}
                        className="w-full"
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Profile Photo
                      </Button>
                    </>
                  </FormControl>
                  <FormDescription>
                    {form.watch('profilePictureUrl') && typeof form.watch('profilePictureUrl') === 'string' && !form.watch('profilePictureUrl').startsWith('data:') ? 
                    `Current URL: ${form.watch('profilePictureUrl')}` : 
                    form.watch('profilePictureUrl') ? 'New photo selected.' : 'No photo selected.'}
                     Ideal aspect ratio: 1:1.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="cardBackgroundUrl"
              render={() => ( // field is not directly used here
                <FormItem>
                  <FormLabel className="flex items-center"><ImagePlus className="mr-2 h-4 w-4" />Card Background Image</FormLabel>
                  <FormControl>
                     <>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={cardBackgroundInputRef}
                        onChange={(e) => handleFileChange(e, 'cardBackgroundUrl')}
                        className="hidden"
                        data-ai-hint="abstract background"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => cardBackgroundInputRef.current?.click()}
                        className="w-full"
                      >
                         <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Background Image
                      </Button>
                    </>
                  </FormControl>
                  <FormDescription>
                    {form.watch('cardBackgroundUrl') && typeof form.watch('cardBackgroundUrl') === 'string' && !form.watch('cardBackgroundUrl').startsWith('data:') ?
                     `Current URL: ${form.watch('cardBackgroundUrl')}` : 
                     form.watch('cardBackgroundUrl') ? 'New background selected.' : 'No background selected.'} 
                     Ideal aspect ratio: 9:16 (portrait).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 border-t mt-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Info className="mr-2 h-5 w-5 text-accent" />For AI Design Assistant</h3>
              <FormField
                control={form.control}
                name="userInfo"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4" />Your Info (Profession, Interests)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. UI/UX designer passionate about accessibility and minimalist design." {...field} />
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
                    <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4" />Target Audience</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. Potential employers, freelance clients, design community peers." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
