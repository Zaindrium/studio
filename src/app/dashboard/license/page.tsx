
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText, Repeat, ShieldCheck, Users, CalendarClock, Star, CheckCircle, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { useCurrentPlan, type PlanId } from '@/hooks/use-current-plan';
import { useToast } from '@/hooks/use-toast';

// Define plan details - this could be moved to a shared file
const allPlansData = [
  {
    id: 'free' as PlanId,
    name: 'Personal Free',
    price: '$0',
    priceMonthly: 0,
    currencySymbol: '$',
    frequency: '/ month',
    features: ['Up to 5 Cards', 'Basic Analytics', 'Standard Templates'],
    userLimit: 1,
    cardLimit: 5,
    isBusiness: false,
  },
  {
    id: 'starter' as PlanId,
    name: 'Business Starter',
    price: '$19',
    priceMonthly: 19,
    currencySymbol: '$',
    frequency: '/ month',
    features: ['Up to 50 Cards', 'Up to 5 Users', 'Advanced Analytics', 'Custom Templates', 'Team Management'],
    userLimit: 5,
    cardLimit: 50,
    isBusiness: true,
  },
  {
    id: 'growth' as PlanId,
    name: 'Business Growth',
    price: 'R115', // Updated for consistency with previous requests
    priceMonthly: 115,
    currencySymbol: 'R',
    frequency: '/ month',
    features: ['Up to 200 Cards', 'Up to 20 Users', 'All Starter Features', 'Priority Support', 'Batch Card Generation'],
    userLimit: 20,
    cardLimit: 200,
    isBusiness: true,
    popular: true,
  },
  {
    id: 'enterprise' as PlanId,
    name: 'Business Enterprise',
    price: 'Contact Us',
    priceMonthly: -1, // Indicates custom pricing
    currencySymbol: '',
    frequency: '',
    features: ['Unlimited Cards & Users', 'All Growth Features', 'Dedicated Account Manager', 'API Access', 'Custom Integrations'],
    userLimit: Infinity,
    cardLimit: Infinity,
    isBusiness: true,
  },
];

interface CurrentLicenseDetails {
  planName: string;
  status: "Active" | "Trial" | "Cancelled";
  userLimit: number;
  usersUsed: number; // Mocked for now
  cardLimit: number;
  cardsUsed: number; // Mocked for now
  renewsOn: string; // Mocked
  pricePerMonth: number;
  currencySymbol: string;
}

const DEFAULT_LICENSE_DETAILS: CurrentLicenseDetails = {
    planName: "Business Growth", // Fallback
    status: "Active",
    userLimit: 20,
    usersUsed: 15, // example
    cardLimit: 200,
    cardsUsed: 78, // example
    renewsOn: "August 30, 2024", // example
    pricePerMonth: 115,
    currencySymbol: "R",
};


export default function LicensePage() {
  const { currentPlan: activePlanId, setCurrentPlan: setActivePlanInStorage, isLoading: isPlanLoading } = useCurrentPlan();
  const { toast } = useToast();
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [currentLicenseDetails, setCurrentLicenseDetails] = useState<CurrentLicenseDetails>(DEFAULT_LICENSE_DETAILS);
  const [selectedPlanInDialog, setSelectedPlanInDialog] = useState<PlanId | null>(activePlanId);


  useEffect(() => {
    if (!isPlanLoading && activePlanId) {
      const planDetails = allPlansData.find(p => p.id === activePlanId);
      if (planDetails) {
        setCurrentLicenseDetails({
          planName: planDetails.name,
          status: "Active", // Assuming active for simplicity
          userLimit: planDetails.userLimit,
          usersUsed: DEFAULT_LICENSE_DETAILS.usersUsed, // Keep mock usage for now
          cardLimit: planDetails.cardLimit,
          cardsUsed: DEFAULT_LICENSE_DETAILS.cardsUsed, // Keep mock usage
          renewsOn: DEFAULT_LICENSE_DETAILS.renewsOn, // Keep mock renewal
          pricePerMonth: planDetails.priceMonthly,
          currencySymbol: planDetails.currencySymbol,
        });
        setSelectedPlanInDialog(activePlanId);
      } else {
         // Fallback if plan ID from storage isn't in our data (e.g. corrupted storage)
         const defaultPlan = allPlansData.find(p => p.id === 'growth') || allPlansData[0];
         setCurrentLicenseDetails({
            planName: defaultPlan.name,
            status: "Active",
            userLimit: defaultPlan.userLimit,
            usersUsed: DEFAULT_LICENSE_DETAILS.usersUsed,
            cardLimit: defaultPlan.cardLimit,
            cardsUsed: DEFAULT_LICENSE_DETAILS.cardsUsed,
            renewsOn: DEFAULT_LICENSE_DETAILS.renewsOn,
            pricePerMonth: defaultPlan.priceMonthly,
            currencySymbol: defaultPlan.currencySymbol,
         });
         setSelectedPlanInDialog(defaultPlan.id);
      }
    }
  }, [activePlanId, isPlanLoading]);

  const userUsagePercentage = currentLicenseDetails.userLimit > 0 && currentLicenseDetails.userLimit !== Infinity ? (currentLicenseDetails.usersUsed / currentLicenseDetails.userLimit) * 100 : 0;
  const cardUsagePercentage = currentLicenseDetails.cardLimit > 0 && currentLicenseDetails.cardLimit !== Infinity ? (currentLicenseDetails.cardsUsed / currentLicenseDetails.cardLimit) * 100 : 0;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      default: return 'destructive';
    }
  };
  
  const handleConfirmPlanChangeInDialog = () => {
    if (selectedPlanInDialog) {
      setActivePlanInStorage(selectedPlanInDialog);
      const planDetails = allPlansData.find(p => p.id === selectedPlanInDialog);
      toast({
        title: "Plan Updated (Simulated)",
        description: `Your plan has been changed to ${planDetails?.name || 'the selected plan'}.`,
      });
      setIsPlanDialogOpen(false);
    }
  };

  if (isPlanLoading) {
    return <div className="text-center py-10">Loading license details...</div>;
  }

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
                <Badge variant={getStatusVariant(currentLicenseDetails.status)} className="text-sm">{currentLicenseDetails.planName} - {currentLicenseDetails.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Plan Name:</p>
                  <p className="font-semibold">{currentLicenseDetails.planName}</p>
                </div>
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Status:</p>
                  <p className="font-semibold">{currentLicenseDetails.status}</p>
                </div>
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Price:</p>
                  <p className="font-semibold">
                    {currentLicenseDetails.pricePerMonth === -1 ? 'Custom' : `${currentLicenseDetails.currencySymbol}${currentLicenseDetails.pricePerMonth}/month`}
                  </p>
                </div>
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Renews On:</p>
                  <p className="font-semibold flex items-center"><CalendarClock className="mr-2 h-4 w-4"/>{currentLicenseDetails.renewsOn}</p>
                </div>
              </div>
              
              <Separator className="my-4" />

              <div>
                <h4 className="font-medium mb-2 text-md flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />User Quota</h4>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-sm text-muted-foreground">
                     {currentLicenseDetails.usersUsed} of {currentLicenseDetails.userLimit === Infinity ? 'Unlimited' : currentLicenseDetails.userLimit} users
                   </span>
                   {currentLicenseDetails.userLimit !== Infinity && <span className="text-sm font-semibold text-primary">{userUsagePercentage.toFixed(0)}%</span>}
                 </div>
                {currentLicenseDetails.userLimit !== Infinity && (
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${userUsagePercentage}%` }}></div>
                    </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2 text-md flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Card Quota</h4>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">
                    {currentLicenseDetails.cardsUsed} of {currentLicenseDetails.cardLimit === Infinity ? 'Unlimited' : currentLicenseDetails.cardLimit} cards
                  </span>
                  {currentLicenseDetails.cardLimit !== Infinity && <span className="text-sm font-semibold text-primary">{cardUsagePercentage.toFixed(0)}%</span>}
                </div>
                {currentLicenseDetails.cardLimit !== Infinity && (
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${cardUsagePercentage}%` }}></div>
                    </div>
                )}
              </div>

            </CardContent>
            <CardFooter className="border-t pt-4">
               <Button onClick={() => { setSelectedPlanInDialog(activePlanId); setIsPlanDialogOpen(true); }} variant="outline" className="w-full md:w-auto">
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
              Explore our plans. Select a new plan and confirm to update your subscription.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
              {allPlansData.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={cn(
                    "flex flex-col transition-all duration-300 hover:shadow-xl cursor-pointer",
                    selectedPlanInDialog === plan.id ? "ring-2 ring-primary shadow-2xl scale-105" : "",
                    plan.popular ? "border-primary" : ""
                  )}
                  onClick={() => plan.price !== 'Contact Us' && setSelectedPlanInDialog(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-md flex items-center">
                      <Star className="h-3 w-3 mr-1" /> Popular
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
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
                        variant={selectedPlanInDialog === plan.id ? "default" : "outline"}
                        disabled={plan.price === 'Contact Us'}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card onClick from firing
                            if(plan.price !== 'Contact Us') setSelectedPlanInDialog(plan.id);
                        }}
                      >
                        {selectedPlanInDialog === plan.id ? 'Selected' : (plan.price === 'Contact Us' ? 'Contact Sales' : 'Select Plan')}
                      </Button>
                   </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4 flex-col sm:flex-row sm:justify-between items-center">
             <p className="text-xs text-muted-foreground mb-2 sm:mb-0">
                Selected: {allPlansData.find(p => p.id === selectedPlanInDialog)?.name || 'None'}
             </p>
            <div>
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="mr-2">Cancel</Button>
                </DialogClose>
                <Button 
                    type="button" 
                    onClick={handleConfirmPlanChangeInDialog}
                    disabled={!selectedPlanInDialog || selectedPlanInDialog === activePlanId}
                >
                    Confirm Change
                </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
