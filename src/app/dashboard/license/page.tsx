
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
import { APP_PLANS, type AppPlan } from '@/lib/app-types'; // Import APP_PLANS and AppPlan
import { useToast } from '@/hooks/use-toast';

interface CurrentLicenseDisplayDetails {
  planName: string;
  status: "Active" | "Trial" | "Cancelled";
  staffIncluded: string; // e.g. "Up to 5 Staff"
  staffUsed: number; 
  renewsOn: string; 
  priceString: string; // e.g. "R249/month" or "Custom Quote"
  userLimitForProgress: number; // Numeric limit for progress bar calculation
}

const DEFAULT_FALLBACK_LICENSE_DETAILS: CurrentLicenseDisplayDetails = {
    planName: "Business Growth", 
    status: "Active",
    staffIncluded: "Up to 15 Staff",
    staffUsed: 0, 
    renewsOn: "N/A", 
    priceString: "R499/month",
    userLimitForProgress: 15,
};


export default function LicensePage() {
  const { currentPlan: activePlanIdFromAuth, setCurrentPlan: setActivePlanInFirestore, isLoading: isPlanLoading } = useCurrentPlan();
  const { toast } = useToast();
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [currentLicenseDetails, setCurrentLicenseDetails] = useState<CurrentLicenseDisplayDetails>(DEFAULT_FALLBACK_LICENSE_DETAILS);
  const [selectedPlanInDialog, setSelectedPlanInDialog] = useState<PlanId | null>(null);

  useEffect(() => {
    if (!isPlanLoading && activePlanIdFromAuth) {
      const planDetails = APP_PLANS.find(p => p.id === activePlanIdFromAuth);
      if (planDetails) {
        setCurrentLicenseDetails({
          planName: planDetails.name,
          status: "Active", // Assuming active if a plan is set
          staffIncluded: planDetails.staffIncluded,
          staffUsed: 0, // TODO: Fetch actual staff usage data
          renewsOn: "N/A", // TODO: Fetch actual renewal date if applicable
          priceString: planDetails.price === "Custom Quote" ? "Custom Quote" : `${planDetails.price}${planDetails.frequency}`,
          userLimitForProgress: planDetails.userLimit,
        });
        setSelectedPlanInDialog(activePlanIdFromAuth);
      } else {
         const defaultPlan = APP_PLANS.find(p => p.id === 'growth') || APP_PLANS.find(p => p.isBusiness) || APP_PLANS[0];
         setCurrentLicenseDetails({
            planName: defaultPlan.name, status: "Active", staffIncluded: defaultPlan.staffIncluded, staffUsed: 0,
            renewsOn: "N/A", priceString: defaultPlan.price === "Custom Quote" ? "Custom Quote" : `${defaultPlan.price}${defaultPlan.frequency}`,
            userLimitForProgress: defaultPlan.userLimit,
         });
         setSelectedPlanInDialog(defaultPlan.id);
      }
    }
  }, [activePlanIdFromAuth, isPlanLoading]);

  const staffUsagePercentage = currentLicenseDetails.userLimitForProgress > 0 && currentLicenseDetails.userLimitForProgress !== Infinity 
    ? (currentLicenseDetails.staffUsed / currentLicenseDetails.userLimitForProgress) * 100 
    : 0;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      default: return 'destructive';
    }
  };
  
  const handleConfirmPlanChangeInDialog = async () => {
    if (selectedPlanInDialog && selectedPlanInDialog !== activePlanIdFromAuth) {
      try {
        await setActivePlanInFirestore(selectedPlanInDialog);
        const planDetails = APP_PLANS.find(p => p.id === selectedPlanInDialog);
        toast({
          title: "Plan Updated",
          description: `Your plan has been changed to ${planDetails?.name || 'the selected plan'}.`,
        });
      } catch (error) {
        console.error("Failed to update plan:", error);
        toast({
            title: "Update Failed",
            description: "Could not update your subscription plan. Please try again.",
            variant: "destructive",
        });
      }
    }
    setIsPlanDialogOpen(false);
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
                  <p className="font-semibold">{currentLicenseDetails.priceString}</p>
                </div>
                <div className="space-y-1 p-3 bg-secondary/30 rounded-md">
                  <p className="text-muted-foreground">Renews On:</p>
                  <p className="font-semibold flex items-center"><CalendarClock className="mr-2 h-4 w-4"/>{currentLicenseDetails.renewsOn}</p>
                </div>
              </div>
              
              <Separator className="my-4" />

              <div>
                <h4 className="font-medium mb-2 text-md flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Staff Quota ({currentLicenseDetails.staffIncluded})</h4>
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-sm text-muted-foreground">
                     {currentLicenseDetails.staffUsed} of {currentLicenseDetails.userLimitForProgress === Infinity ? 'Unlimited' : currentLicenseDetails.userLimitForProgress} staff members
                   </span>
                   {currentLicenseDetails.userLimitForProgress !== Infinity && <span className="text-sm font-semibold text-primary">{staffUsagePercentage.toFixed(0)}%</span>}
                 </div>
                {currentLicenseDetails.userLimitForProgress !== Infinity && (
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${staffUsagePercentage}%` }}></div>
                    </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
               <Button onClick={() => { setSelectedPlanInDialog(activePlanIdFromAuth); setIsPlanDialogOpen(true); }} variant="outline" className="w-full md:w-auto">
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
              {APP_PLANS.map((plan) => (
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
                    <CardDescription className="text-muted-foreground mt-1">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-sm">{plan.frequency}</span>
                    </CardDescription>
                     {plan.description && (
                        <p className="text-xs text-muted-foreground mt-2 min-h-[40px]">{plan.description}</p>
                     )}
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3 pt-0">
                    <p className="text-sm font-medium text-center text-primary py-2 border-y">
                      {plan.staffIncluded}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.extraStaffCost && plan.extraStaffUnit && (
                      <p className="text-xs text-muted-foreground pt-2">
                        Extra Staff: {plan.extraStaffCost}{plan.extraStaffUnit}
                      </p>
                    )}
                  </CardContent>
                   <CardFooter>
                     <Button 
                        className="w-full"
                        variant={selectedPlanInDialog === plan.id ? "default" : "outline"}
                        disabled={plan.price === 'Contact Us'}
                        onClick={(e) => {
                            e.stopPropagation(); 
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
                Selected: {APP_PLANS.find(p => p.id === selectedPlanInDialog)?.name || 'None'}
             </p>
            <div>
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="mr-2">Cancel</Button>
                </DialogClose>
                <Button 
                    type="button" 
                    onClick={handleConfirmPlanChangeInDialog}
                    disabled={!selectedPlanInDialog || selectedPlanInDialog === activePlanIdFromAuth}
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
