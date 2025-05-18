
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
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { CompanyProfile, AdminUser, PlanId } from '@/lib/app-types';

const DEFAULT_INITIAL_PLAN: PlanId = 'growth';

// Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignupWithProvider = async (user: import('firebase/auth').User) => {
    // This function would be called after a successful Google Sign-In
    // For now, we assume company and admin name are not yet collected for Google flow.
    // A more complete flow would prompt for these after Google sign-in if it's a new user.
    
    // For demonstration, if adminName or companyName are not set (e.g. via Google sign-up),
    // we'd ideally prompt for them or use defaults.
    const effectiveAdminName = adminName || user.displayName || "Google Admin";
    const effectiveCompanyName = companyName || "My Google Company";


    // Create Company Profile in Firestore
    const companyRef = doc(db, "companies", user.uid);
    const companyProfile: CompanyProfile = {
      id: user.uid,
      name: effectiveCompanyName,
      activePlanId: DEFAULT_INITIAL_PLAN,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(companyRef, companyProfile);

    // Create Admin User Profile in Firestore
    const adminRef = doc(db, `companies/${user.uid}/admins`, user.uid);
    const adminProfile: AdminUser = {
      id: user.uid,
      companyId: user.uid,
      companyName: effectiveCompanyName,
      name: effectiveAdminName,
      email: user.email || '',
      emailVerified: user.emailVerified,
      role: 'Owner',
      status: 'Active', // Assume active after Google sign-in
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(adminRef, adminProfile);

    toast({
      title: "Company Account Created!",
      description: `Welcome, ${effectiveAdminName}! Please select your subscription plan.`,
      variant: "default",
    });
    router.push('/subscription');
  };


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
      await handleSignupWithProvider(user); // Reuse logic for Firestore document creation

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
      } else {
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

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    toast({
      title: "Signing up with Google...",
    });
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // After Google sign-in, we need to check if this user already exists in our Firestore admins
      // For simplicity, this example assumes a new user will be created.
      // A production app would check if user.uid exists in `companies/{any_company_id}/admins`
      // or if `companies/{user.uid}` exists, to prevent duplicate company creation or link accounts.
      await handleSignupWithProvider(user);

    } catch (error: any) {
      console.error("Google Sign-Up Failed:", error);
      toast({
        title: "Google Sign-Up Failed",
        description: error.message || "Could not sign up with Google. Please try again or use email/password.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
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
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>Admin Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="•••••••• (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? 'Creating Account...' : 'Create Company & Admin Account'}
          </Button>

          <div className="relative w-full py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? 'Processing...' : <><GoogleIcon /> Sign up with Google</>}
            </Button>

          <p className="text-sm text-muted-foreground pt-2">
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
