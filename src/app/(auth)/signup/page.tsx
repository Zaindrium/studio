
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { UserPlus, Mail, Key, Building, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { CompanyProfile, AdminUser, PlanId } from '@/lib/app-types';

const DEFAULT_INITIAL_PLAN: PlanId = 'growth'; // Or 'free' if you prefer that as initial

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast({
      title: "Creating Company Account...",
      description: "Please wait while we set up your company and admin account.",
    });

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please re-enter.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!adminName.trim() || !companyName.trim()) {
        toast({
            title: "Missing Information",
            description: "Please provide your name and company name.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create Company Profile in Firestore
      const companyRef = doc(db, "companies", user.uid); // Using user.uid as companyId
      const companyProfile: CompanyProfile = {
        id: user.uid,
        name: companyName,
        activePlanId: DEFAULT_INITIAL_PLAN, // Set default plan
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(companyRef, companyProfile);

      // Create Admin User Profile in Firestore
      const adminRef = doc(db, `companies/${companyProfile.id}/admins`, user.uid);
      const adminProfile: AdminUser = {
        id: user.uid,
        companyId: companyProfile.id,
        name: adminName,
        email: user.email || '',
        emailVerified: user.emailVerified,
        role: 'Owner',
        status: 'Active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(adminRef, adminProfile);

      toast({
        title: "Company Account Created!",
        description: `Welcome, ${adminName}! Please select your subscription plan.`,
        variant: "default",
      });
      // Redirect to subscription page after signup
      router.push('/subscription');
    } catch (error: any) {
      console.error("Error during admin & company signup:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: "Signup Failed",
          description: "This email address is already in use. Please try logging in or use a different email.",
          variant: "destructive",
          duration: 7000,
        });
      } else if (error.code === 'auth/api-key-not-valid') {
        toast({
          title: "Firebase API Key Error",
          description: "The Firebase API key is invalid. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is correct and that you've restarted your development server.",
          variant: "destructive",
          duration: 9000,
        });
      } else if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('permission-denied'))) {
        toast({
          title: "Database Permission Error",
          description: "Could not save company or admin data. Please check your Firestore Security Rules to ensure authenticated users can write to 'companies/{userId}' and 'companies/{userId}/admins/{userId}'.",
          variant: "destructive",
          duration: 10000,
        });
      }
       else {
        toast({
          title: "Signup Failed",
          description: error.message || "Could not create your account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <UserPlus className="mr-2 h-6 w-6 text-primary" /> Create Company Account
        </CardTitle>
        <CardDescription>
          Set up your company and create the primary administrator account for LinkUP.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary"/>Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Your Company Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminName" className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-primary"/>Your Full Name (Admin)</Label>
            <Input
              id="adminName"
              type="text"
              placeholder="Admin Full Name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary"/>Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>Admin Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>Confirm Admin Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Company & Admin Account'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an admin account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
