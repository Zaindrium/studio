
"use client";

import React, { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Key, LogIn, HelpCircle, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { CompanyProfile, AdminUser, PlanId } from '@/lib/app-types';
import { APP_PLANS } from '@/lib/app-types';

const Button = lazy(() => import("@/components/ui/button").then(m => ({ default: m.Button })));
const Card = lazy(() => import("@/components/ui/card").then(m => ({ default: m.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardContent })));
const CardDescription = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardDescription })));
const CardFooter = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardFooter })));
const CardHeader = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardHeader })));
const CardTitle = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardTitle })));
const Input = lazy(() => import("@/components/ui/input").then(m => ({ default: m.Input })));
const Label = lazy(() => import("@/components/ui/label").then(m => ({ default: m.Label })));

const DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY: PlanId = APP_PLANS.find(p => p.id === 'growth')?.id || 'growth';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const performPostLoginSetupIfNeeded = async (user: User) => {
    const adminRef = doc(db, `companies/${user.uid}/admins`, user.uid);
    const adminDocSnap = await getDoc(adminRef);

    if (!adminDocSnap.exists()) {
      // Account setup was deferred (likely an email/password signup that just got verified)
      // Or a first-time Google Sign-In that didn't complete initial setup.
      toast({
        title: "Completing Account Setup...",
        description: "Creating your company and admin profile.",
      });

      const defaultAdminName = user.displayName || user.email?.split('@')[0] || 'Admin User';
      const defaultCompanyName = `${defaultAdminName}'s Company`;

      // Create Company Profile
      const companyRef = doc(db, "companies", user.uid);
      const companyProfile: CompanyProfile = {
        id: user.uid,
        name: defaultCompanyName,
        activePlanId: DEFAULT_INITIAL_PLAN_ID_FOR_NEW_COMPANY,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(companyRef, companyProfile);

      // Create Admin User Profile
      const adminProfile: AdminUser = {
        id: user.uid,
        companyId: user.uid,
        companyName: defaultCompanyName,
        name: defaultAdminName,
        email: user.email || '',
        emailVerified: user.emailVerified,
        role: 'Owner',
        status: 'Active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(adminRef, adminProfile);
      
      // After setup, it's good to redirect them to subscription page if it's a brand new setup
      router.push('/subscription');
      return true; // Indicates setup was performed and navigation handled
    }
    return false; // Setup was not needed or already done
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast({
      title: "Attempting Admin Login...",
      description: "Please wait while we verify your credentials.",
    });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast({
          title: "Email Not Verified",
          description: "Please check your inbox for the verification link.",
          variant: "destructive",
          duration: 7000,
        });
        setIsLoading(false);
        return;
      }
      
      const setupPerformedAndNavigated = await performPostLoginSetupIfNeeded(user);
      if (setupPerformedAndNavigated) return; // Navigation handled by setup

      toast({
        title: "Admin Login Successful!",
        description: "Redirecting to your Business Dashboard...",
        variant: "default",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Admin Login Failed:", error);
      let description = "Invalid email or password.";
      if (error.code === 'auth/invalid-email') {
        description = "The email address is not valid. Please check and try again.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        description = "Incorrect email or password. Please try again.";
      } else if (error.message) {
        description = error.message;
      }
      toast({
        title: "Admin Login Failed",
        description: description,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    toast({
      title: "Signing in with Google...",
    });
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Google emails are usually verified, but good to check
      if (!user.emailVerified) {
          toast({
            title: "Verify Your Google Email",
            description: "Please verify your Google email address through any confirmation sent by Google. This is unusual but necessary.",
            variant: "destructive",
            duration: 9000,
          });
          setIsGoogleLoading(false);
          return;
      }

      const setupPerformedAndNavigated = await performPostLoginSetupIfNeeded(user);
      if (setupPerformedAndNavigated) return; // Navigation handled by setup


      toast({
        title: "Google Sign-In Successful!",
        description: "Redirecting to your dashboard...",
        variant: "default",
      });
      router.push('/dashboard'); 
    } catch (error: any) {
      console.error("Google Sign-In Failed:", error);
      let description = "Could not sign in with Google. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "Google Sign-In cancelled.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = "An account already exists with this email using a different sign-in method.";
      } else if (error.code === 'auth/unauthorized-domain') {
        description = "This domain is not authorized for Google Sign-In. Please check your Firebase project settings and add this domain to 'Authorized domains' under Authentication -> Settings.";
      } else if (error.message) {
        description = error.message;
      }
      toast({
        title: "Google Sign-In Failed",
        description: description,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        title: "Enter Email",
        description: "Please enter your email address to reset your password.",
        variant: "default",
      });
      return;
    }
    toast({
      title: "Password Reset (Simulated)",
      description: `If an account exists for ${email}, a password reset link would be sent. (This is a simulation)`,
      duration: 7000,
    });
  };

  return (
    <Suspense fallback={<Skeleton className="w-full h-[480px] rounded-lg" />}>
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <LogIn className="mr-2 h-6 w-6 text-primary" /> Admin Log In
          </CardTitle>
          <CardDescription>
            Access your LinkUP company dashboard. <br />
            Test with: admin@business.com / password123 
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary"/>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="link" size="sm" onClick={handleForgotPassword} className="px-0 text-xs h-auto text-muted-foreground hover:text-primary">
                <HelpCircle className="mr-1 h-3 w-3" /> Forgot Password?
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? 'Signing In...' : <><GoogleIcon /> Sign in with Google</>}
            </Button>

            <p className="text-sm text-muted-foreground text-center pt-2">
              Need to set up a new company?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </p>
             <p className="text-xs text-muted-foreground text-center">
              Employee access?{' '}
              <Link href="/employee-access" className="font-medium text-primary hover:underline">
                Use Access Code
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </Suspense>
  );
}

    