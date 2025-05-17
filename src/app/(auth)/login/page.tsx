
"use client";

import React, { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Key, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth';

const Button = lazy(() => import("@/components/ui/button").then(m => ({ default: m.Button })));
const Card = lazy(() => import("@/components/ui/card").then(m => ({ default: m.Card })));
const CardContent = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardContent })));
const CardDescription = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardDescription })));
const CardFooter = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardFooter })));
const CardHeader = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardHeader })));
const CardTitle = lazy(() => import("@/components/ui/card").then(m => ({ default: m.CardTitle })));
const Input = lazy(() => import("@/components/ui/input").then(m => ({ default: m.Input })));
const Label = lazy(() => import("@/components/ui/label").then(m => ({ default: m.Label })));

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast({
      title: "Attempting Admin Login...",
      description: "Please wait while we verify your credentials.",
    });

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful Firebase login, Firebase handles session.
      // Now, you would typically fetch the user's role/company info from Firestore
      // to determine if they are indeed an admin for *this* application.
      // For this step, we'll assume login success means they are a valid admin.

      toast({
        title: "Admin Login Successful!",
        description: "Redirecting to your Business Dashboard...",
        variant: "default",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Admin Login Failed:", error);
      toast({
        title: "Admin Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<Skeleton className="w-full h-[400px] rounded-lg" />}>
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <LogIn className="mr-2 h-6 w-6 text-primary" /> Admin Log In to LinkUP
          </CardTitle>
          <CardDescription>
            Enter your administrator credentials to access your company's dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary"/>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@examplecorp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Need to set up a new company?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </Suspense>
  );
}
