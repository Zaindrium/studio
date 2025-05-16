
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from 'next/link';
import { UserPlus, Mail, Key, Building, UserCircle } from 'lucide-react';

type AccountType = "personal" | "business";

export default function SignupPage() {
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    if (password !== confirmPassword) {
      // Handle password mismatch - typically with a toast
      console.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    // Placeholder for actual signup logic
    console.log("Signup attempt with:", { accountType, email, password, companyName, adminName });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    // On success, redirect to login or verification step, on error, show toast.
    setIsLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <UserPlus className="mr-2 h-6 w-6 text-primary" /> Create Your LinkUP Account
        </CardTitle>
        <CardDescription>
          Join LinkUP to start creating and sharing digital cards.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center">Account Type</Label>
            <RadioGroup
              defaultValue="personal"
              onValueChange={(value) => setAccountType(value as AccountType)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal">Personal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business">Business</Label>
              </div>
            </RadioGroup>
          </div>

          {accountType === 'business' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary"/>Company Name</Label>
                <Input 
                  id="companyName" 
                  type="text" 
                  placeholder="Your Company Inc." 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required={accountType === 'business'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName" className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-primary"/>Your Name (Admin)</Label>
                <Input 
                  id="adminName" 
                  type="text" 
                  placeholder="Admin Full Name" 
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required={accountType === 'business'}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary"/>Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
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
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center"><Key className="mr-2 h-4 w-4 text-primary"/>Confirm Password</Label>
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
