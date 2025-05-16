
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  // In a real app, this page would likely take a token from the URL query parameters
  // and send it to the backend for verification.

  return (
    <Card className="w-full text-center">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-center">
          <MailCheck className="mr-2 h-6 w-6 text-primary" /> Almost There!
        </CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address.
          Please check your inbox and click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive an email? Check your spam folder or{' '}
          <Button variant="link" className="p-0 h-auto text-primary">
            resend the verification email.
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
