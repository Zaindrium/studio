
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { KeySquare, UserCircle, Mail, Key } from 'lucide-react';

export default function EmployeeAccessPage() {
  const [accessCode, setAccessCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // May be pre-filled or editable
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false); // Step 1: Verify Code

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Placeholder for actual code verification logic
    console.log("Verifying access code:", accessCode);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    // On success, set isCodeVerified to true and potentially pre-fill email.
    // For demo:
    if (accessCode === "VALIDCODE") {
      setIsCodeVerified(true);
      setEmail("employee@example.com"); // Example prefill
    } else {
      // Show error toast
      console.error("Invalid access code");
    }
    setIsLoading(false);
  };

  const handleSetupAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    // Placeholder for actual account setup logic
    console.log("Setting up employee account:", { accessCode, name, email, password });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    // On success, redirect to login or dashboard.
    setIsLoading(false);
  };

  if (!isCodeVerified) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <KeySquare className="mr-2 h-6 w-6 text-primary" /> Enter Access Code
          </CardTitle>
          <CardDescription>
            Enter the access code provided in your invitation email to join your organization.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerifyCode}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>Access Code</Label>
              <Input 
                id="accessCode" 
                type="text" 
                placeholder="Your unique access code" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required 
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Lost your code? Contact your administrator.
            </p>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
         <UserCircle className="mr-2 h-6 w-6 text-primary" /> Set Up Your Employee Account
        </CardTitle>
        <CardDescription>
          Complete your profile and set a password to access LinkUP.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSetupAccount}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-primary"/>Full Name</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="Your Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary"/>Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              // Could be readOnly if pre-filled and non-editable
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>New Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Setting Up Account...' : 'Complete Setup & Log In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
