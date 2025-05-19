
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Added
import { auth } from '@/lib/firebase'; // Added
import { sendEmailVerification } from 'firebase/auth'; // Added

export default function VerifyEmailPage() {
  const { toast } = useToast(); // Added

  // In a real app, this page might take a token from the URL query parameters
  // and send it to the backend for verification.
  // For now, it primarily serves as an informational page.

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: "Verification Email Resent",
          description: "A new verification link has been sent to your email address.",
        });
      } catch (error: any) {
        console.error("Error resending verification email:", error);
        toast({
          title: "Error",
          description: `Could not resend verification email: ${error.message}`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Logged In",
        description: "Cannot resend verification email. Please log in first if you have an account, or sign up.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full text-center">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-center">
          <MailCheck className="mr-2 h-6 w-6 text-primary" /> Almost There!
        </CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address.
          Please check your inbox (and spam folder) and click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive an email?{' '}
          <Button variant="link" className="p-0 h-auto text-primary" onClick={handleResendVerification}> {/* Updated */}
            Resend the verification email.
          </Button>
        </p>
        <p className="text-sm text-muted-foreground">
          Once verified, you can log in to your account.
        </p>
         <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
      </CardContent>
    </Card>
  );
}

    