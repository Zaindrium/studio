
"use client";

import React from 'react';
import Link from 'next/link'; // Import Link
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Repeat, ShieldCheck, Users, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock data - in a real app, this would come from an API
const currentLicense = {
  planName: "Business Growth",
  status: "Active" as "Active" | "Trial" | "Cancelled",
  userLimit: 20,
  usersUsed: 15,
  cardLimit: 200,
  cardsUsed: 78,
  renewsOn: "August 30, 2024",
  pricePerMonth: 115, 
  currencySymbol: "R", 
};

export default function LicensePage() {
  const userUsagePercentage = currentLicense.userLimit > 0 ? (currentLicense.usersUsed / currentLicense.userLimit) * 100 : 0;
  const cardUsagePercentage = currentLicense.cardLimit > 0 ? (currentLicense.cardsUsed / currentLicense.cardLimit) * 100 : 0;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      default: return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><CreditCard className="mr-3 h-7 w-7 text-primary"/>License Management</CardTitle>
          <CardDescription>View your current subscription details, manage billing, and explore plan options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Current Plan Details Section */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-xl"><ShieldCheck className="mr-2 h-6 w-6 text-green-500"/>Current Plan</CardTitle>
                <Badge variant={getStatusVariant(currentLicense.status)} className="text-sm">{currentLicense.planName} - {currentLicense.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Plan Name:</p>
                  <p className="font-semibold">{currentLicense.planName}</p>
                </div>
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Status:</p>
                  <p className="font-semibold">{currentLicense.status}</p>
                </div>
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Price:</p>
                  <p className="font-semibold">{currentLicense.currencySymbol}{currentLicense.pricePerMonth}/month</p>
                </div>
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Renews On:</p>
                  <p className="font-semibold flex items-center"><CalendarClock className="mr-2 h-4 w-4"/>{currentLicense.renewsOn}</p>
                </div>
              </div>
              
              <Separator className="my-4" />

              <div>
                <h4 className="font-medium mb-2 text-md flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />User Quota</h4>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{currentLicense.usersUsed} of {currentLicense.userLimit} users</span>
                  <span className="text-sm font-semibold text-primary">{userUsagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${userUsagePercentage}%` }}></div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-md flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Card Quota</h4>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{currentLicense.cardsUsed} of {currentLicense.cardLimit} cards</span>
                  <span className="text-sm font-semibold text-primary">{cardUsagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${cardUsagePercentage}%` }}></div>
                </div>
              </div>

            </CardContent>
            <CardFooter className="border-t pt-4">
               <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href="/subscription"> {/* Updated Link */}
                  <Repeat className="mr-2 h-4 w-4" /> Change Plan or View Options
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Billing Information Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><FileText className="mr-2 h-6 w-6 text-primary"/>Billing Information</CardTitle>
              <CardDescription>Manage your payment methods and view your billing history.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This section will allow you to update your payment details, download invoices, and see your transaction history.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="default" className="w-full sm:w-auto">Manage Payment Methods</Button>
                <Button variant="outline" className="w-full sm:w-auto">View Billing History</Button>
              </div>
            </CardContent>
          </Card>
          
        </CardContent>
      </Card>
    </div>
  );
}
