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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Phone, Mail, Globe, Linkedin, Twitter, Github, MapPin, Info, Users, Image as ImageIcon } from 'lucide-react';
import React from 'react';

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
  profilePictureUrl: z.string().url({ message: 'Invalid URL for profile picture.' }).optional().or(z.literal('')),
  userInfo: z.string().optional().describe('Information about the user, including their profession and interests for AI assistant.'),
  targetAudience: z.string().optional().describe('The target audience for the business card for AI assistant.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  profile: UserProfile;
  onProfileChange: (data: UserProfile) => void;
}

export function UserProfileForm({ profile, onProfileChange }: UserProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  React.useEffect(() => {
    form.reset(profile); // Reset form when profile prop changes externally (e.g. from AI)
  }, [profile, form]);

  // Watch for changes to update parent state reactively
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
       // Check if the changed field is part of the form schema to avoid issues with non-schema fields
      if (name && profileSchema.shape.hasOwnProperty(name)) {
        onProfileChange(value as UserProfile);
      } else if (!name) { // If name is undefined, means multiple fields might have changed (e.g. on reset)
        onProfileChange(value as UserProfile);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onProfileChange]);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><User className="mr-2 h-6 w-6 text-primary" /> Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6"> {/* Removed onSubmit as updates are reactive */}
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4" />Profile Picture URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://placehold.co/100x100.png" {...field} />
                  </FormControl>
                  <FormDescription>Use a direct link to an image. (e.g., https://placehold.co/100x100.png)</FormDescription>
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
