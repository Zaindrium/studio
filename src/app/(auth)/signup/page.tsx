
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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState(''); // Admin's full name
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

    // Placeholder for actual signup logic (creating company, admin user in Firebase)
    console.log("Admin & Company Signup attempt with:", { adminName, email, password, companyName });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    toast({
      title: "Company Account Created!",
      description: `Welcome, ${adminName}! Redirecting to your Business Dashboard...`,
      variant: "default",
    });
    router.push('/dashboard'); // Redirect to dashboard after admin/company setup
    // In a real app, might redirect to subscription or email verification.
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
