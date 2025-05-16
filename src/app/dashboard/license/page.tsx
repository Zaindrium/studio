
"use client";

import React, { useState } from 'react';
// Removed Link import as button now opens dialog
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Repeat, ShieldCheck, Users, CalendarClock, Star, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Not needed if button controls state directly
  DialogClose,
  DialogFooter, // Added DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

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

// Copied from /src/app/(auth)/subscription/page.tsx for the dialog
const plansData = [
  {
    id: 'free',
    name: 'Personal Free',
    price: '$0',
    frequency: '/ month',
    features: ['Up to 5 Cards', 'Basic Analytics', 'Standard Templates'],
    userLimit: 1,
    isBusiness: false,
  },
  {
    id: 'starter',
    name: 'Business Starter',
    price: '$19',
    frequency: '/ month',
    features: ['Up to 50 Cards', 'Up to 5 Users', 'Advanced Analytics', 'Custom Templates', 'Team Management'],
    userLimit: 5,
    isBusiness: true,
  },
  {
    id: 'growth',
    name: 'Business Growth',
    price: '$49', // This will be overridden by currentLicense.pricePerMonth for display if this plan matches
    frequency: '/ month',
    features: ['Up to 200 Cards', 'Up to 20 Users', 'All Starter Features', 'Priority Support', 'Batch Card Generation'],
    userLimit: 20,
    isBusiness: true,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Business Enterprise',
    price: 'Contact Us',
    frequency: '',
    features: ['Unlimited Cards & Users', 'All Growth Features', 'Dedicated Account Manager', 'API Access', 'Custom Integrations'],
    userLimit: Infinity,
    isBusiness: true,
  },
];


export default function LicensePage() {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

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
               <Button onClick={() => setIsPlanDialogOpen(true)} variant="outline" className="w-full md:w-auto">
                  <Repeat className="mr-2 h-4 w-4" /> Change Plan or View Options
                </Button>
            </CardFooter>
          </Card>

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
                <Button variant="default" className="w-full sm:w-auto" disabled>Manage Payment Methods</Button>
                <Button variant="outline" className="w-full sm:w-auto" disabled>View Billing History</Button>
              </div>
            </CardContent>
          </Card>
          
        </CardContent>
      </Card>

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Subscription Plans</DialogTitle>
            <DialogDescription>
              Explore our plans. To make changes, you might need to visit the main subscription page.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
              {plansData.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={cn(
                    "flex flex-col transition-all duration-300 hover:shadow-xl",
                    plan.popular ? "border-primary ring-2 ring-primary" : ""
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-md flex items-center">
                      <Star className="h-3 w-3 mr-1" /> Popular
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      <span className="text-4xl font-bold text-foreground">{plan.price === '$49' && currentLicense.planName === "Business Growth" ? `${currentLicense.currencySymbol}${currentLicense.pricePerMonth}` : plan.price}</span>
                      <span className="text-sm">{plan.frequency}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                      {plan.isBusiness ? <Users className="inline h-3 w-3 mr-1"/> : null }
                      {plan.userLimit === Infinity ? 'Unlimited Users' : `Up to ${plan.userLimit} User${plan.userLimit > 1 ? 's' : ''}`}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={currentLicense.planName === plan.name ? "default" : "outline"}
                      disabled={plan.price === 'Contact Us' || currentLicense.planName === plan.name}
                      onClick={() => {
                        if(plan.price !== 'Contact Us' && currentLicense.planName !== plan.name) {
                           // In a real app, this would initiate a plan change flow or direct to payment
                           // For now, it just closes the dialog and might link to the main subscription page
                           setIsPlanDialogOpen(false);
                           // router.push('/subscription?plan=' + plan.id); // If actual navigation is needed
                        }
                      }}
                    >
                      {currentLicense.planName === plan.name ? 'Current Plan' : (plan.price === 'Contact Us' ? 'Contact Sales' : 'Choose Plan')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

