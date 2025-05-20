tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter
import { applyActionCode, checkActionCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function HandleActionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const handleAction = async () => {
      if (!mode || !actionCode) {
        setError('Missing action mode or code.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        setMessage('');
        switch (mode) {
          case 'verifyEmail':
            await applyActionCode(auth, actionCode);
            toast({ title: "Success", description: "Your email address has been verified! You can now log in." });
            router.push('/login');
            break;
          case 'resetPassword':
            await checkActionCode(auth, actionCode);
            setMessage('Action code verified. Please enter your new password below.');
            setShowPasswordForm(true);
            break;
          case 'recoverEmail':
            await applyActionCode(auth, actionCode);
            toast({ title: "Success", description: "Your email address has been restored." });
            router.push('/login');
            break;
          default:
            setError('Invalid action mode.');
        }
      } catch (err: any) {
        setShowPasswordForm(false);
        if (mode === 'resetPassword') {
          setError('Invalid or expired password reset code. Please try resetting your password again.');
        } else {
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (actionCode) {
        handleAction();
    } else {
        setError("No action code provided.");
        setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, actionCode]);

  const handlePasswordResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!actionCode) {
        setError('Missing action code for password reset. Please try the link from your email again.');
        return;
    }
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please re-enter them carefully.');
      return;
    }

    setIsResetting(true);
    setMessage('');

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been changed. Please log in with your new password.",
        variant: "default",
      });
      setShowPasswordForm(false);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired, been used, or the new password was too weak.');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    // Ensure loading text is visible on dark background
    return <p className="text-center p-4 text-foreground">Processing action...</p>;
  }

  return (
    // Apply dark theme background and default text color
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {showPasswordForm ? 'Reset Your Password' : (error ? 'Error' : 'Action Status')}
          </CardTitle>
          {!showPasswordForm && message && <CardDescription className="text-green-500 text-center">{message}</CardDescription>}
          {/* Adjusted error text color for better visibility on dark card, if needed */}
          {error && <CardDescription className="text-red-400 text-center">{error}</CardDescription>}
          {showPasswordForm && !error && !message && <CardDescription className="text-center">Enter your new password below.</CardDescription>}
          {showPasswordForm && message && <CardDescription className="text-center">{message}</CardDescription>} 
        </CardHeader>
        <CardContent>
          {showPasswordForm ? (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  type="password" 
                  id="newPassword" 
                  value={newPassword} 
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }} 
                  placeholder="Enter new password (min. 6 characters)" 
                  required 
                  aria-describedby={error ? "password-error-message" : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input 
                  type="password" 
                  id="confirmNewPassword" 
                  value={confirmNewPassword} 
                  onChange={(e) => { setConfirmNewPassword(e.target.value); setError(''); }} 
                  placeholder="Retype new password" 
                  required 
                  aria-describedby={error ? "password-error-message" : undefined}
                />
              </div>
              {/* Adjusted password error text color for better visibility */}
              {error && <p id="password-error-message" className="text-sm text-red-400 text-center">{error}</p>}
              <Button type="submit" className="w-full !mt-8" disabled={isResetting}>
                {isResetting ? 'Resetting Password...' : 'Reset Password & Continue'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-4">
                {(!loading && (message || error)) && 
                  <Button asChild className="w-full">
                      <Link href="/login">Go to Login</Link>
                  </Button>
                }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
