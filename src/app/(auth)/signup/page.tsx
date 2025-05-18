
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
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
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

  const handlePostAuthSetup = async (user: User, isGoogleSignUp: boolean = false) => {
    const effectiveAdminName = isGoogleSignUp ? (user.displayName || "Google User") : adminName;
    const effectiveCompanyName = companyName || (isGoogleSignUp ? `${effectiveAdminName}'s Company` : "My New Company");

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
      status: 'Active',
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
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!adminName.trim() || !companyName.trim()) {
      toast({ title: "Missing Information", description: "Please provide your name and company name.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await handlePostAuthSetup(userCredential.user);
    } catch (error: any) {
      console.error("Error during admin & company signup:", error);
      let description = "Could not create your account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email address is already in use. Please try logging in or use a different email.";
      } else if (error.code === 'auth/api-key-not-valid') {
        description = "Firebase API key is invalid. Please check your .env file and restart your development server.";
      } else if (error.code === 'permission-denied' || (error.message && error.message.toLowerCase().includes('permission-denied'))) {
        description = "Database Permission Error. Check Firestore Security Rules for 'companies/{userId}' and 'companies/{userId}/admins/{userId}'.";
      } else if (error.message) {
        description = error.message;
      }
      toast({ title: "Signup Failed", description, variant: "destructive", duration: 9000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    toast({ title: "Signing up with Google..." });
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // If companyName or adminName aren't set (because this is the Google flow),
      // handlePostAuthSetup will use defaults or user.displayName.
      // For a better UX, you might prompt for companyName if it's empty after Google sign-up.
      await handlePostAuthSetup(result.user, true);
    } catch (error: any) {
      console.error("Google Sign-Up Failed:", error);
      let description = "Could not sign up with Google. Please try again or use email/password.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "Google Sign-Up cancelled.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = "An account already exists with this email using a different sign-in method.";
      } else if (error.code === 'auth/unauthorized-domain') {
        description = "This domain is not authorized for Google Sign-Up. Please check your Firebase project settings and add this domain to 'Authorized domains' under Authentication -> Settings.";
      } else if (error.message) {
        description = error.message;
      }
      toast({ title: "Google Sign-Up Failed", description, variant: "destructive", duration: 9000 });
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
