
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { Mail, Key, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function LoginPage() {
  const router = useRouter(); // Initialize useRouter
  const { toast } = useToast(); // Initialize useToast
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast({
      title: "Attempting Login...",
      description: "Please wait while we verify your credentials.",
    });

    // Placeholder for actual login logic
    console.log("Login attempt with:", { email, password });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    // SIMULATED SUCCESS & REDIRECTION LOGIC
    if (email.toLowerCase() === 'user@example.com' && password === 'password123') {
      toast({
        title: "Personal Login Successful!",
        description: "Redirecting to the Card Editor...",
        variant: "default",
      });
      router.push('/editor');
    } else if (email.toLowerCase() === 'admin@business.com' && password === 'password123') {
      toast({
        title: "Business Login Successful!",
        description: "Redirecting to your Business Dashboard...",
        variant: "default",
      });
      router.push('/dashboard');
    } else {
      toast({ 
        title: "Login Failed", 
        description: "Invalid email or password. Try user@example.com or admin@business.com with password 'password123'.", 
        variant: "destructive",
        duration: 7000,
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl flex items-center justify-center">
          <LogIn className="mr-2 h-6 w-6 text-primary" /> Log In to LinkUP
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account. <br/>
          (Try: user@example.com or admin@business.com, Pass: password123)
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary"/>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com or admin@business.com"
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
              placeholder="password123"
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
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
