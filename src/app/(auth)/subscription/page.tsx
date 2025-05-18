
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Star, Users, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentPlan, type PlanId } from '@/hooks/use-current-plan';
import { APP_PLANS, type AppPlan } from '@/lib/app-types'; // Import APP_PLANS
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const { currentPlan: activePlanIdFromAuth, setCurrentPlan: setActivePlanInFirestore, isLoading: isPlanLoading } = useCurrentPlan();
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isPlanLoading) {
      if (activePlanIdFromAuth) {
        setSelectedPlanId(activePlanIdFromAuth);
      } else {
        // Default selection if no plan is set (e.g., new user)
        // Defaults to 'growth' plan (R499) or the first business plan if 'growth' isn't found
        const defaultPlan = APP_PLANS.find(p => p.id === 'growth' && p.isBusiness) || APP_PLANS.find(p => p.isBusiness) || APP_PLANS[0];
        setSelectedPlanId(defaultPlan.id);
      }
    }
  }, [activePlanIdFromAuth, isPlanLoading]);

  const handleProceedToPayment = async () => {
    if (!selectedPlanId) return;
    setIsProcessing(true);
    
    const selectedPlanDetails = APP_PLANS.find(p => p.id === selectedPlanId);

    try {
      await setActivePlanInFirestore(selectedPlanId);
      toast({
        title: `Plan Selected: ${selectedPlanDetails?.name || 'Selected Plan'}`,
        description: selectedPlanId === 'free' ? "You're now on the Starter plan!" : "Your subscription has been updated. Redirecting...",
      });
      router.push('/dashboard'); 
    } catch (error) {
        console.error("Failed to update plan:", error);
        toast({
            title: "Update Failed",
            description: "Could not update your subscription plan. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsProcessing(false);
    }
  };

  if (isPlanLoading) {
    return <div className="w-full max-w-5xl mx-auto py-8 px-4 text-center">Loading plans...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">Select the perfect plan for your personal or business needs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {APP_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              "flex flex-col transition-all duration-300",
              selectedPlanId === plan.id ? "ring-2 ring-primary shadow-2xl scale-105" : "hover:shadow-xl",
              plan.popular ? "border-primary" : ""
            )}
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
                onClick={() => setSelectedPlanId(plan.id)}
                className="w-full"
                variant={selectedPlanId === plan.id ? "default" : "outline"}
                disabled={plan.price === 'Contact Us'}
              >
                {plan.price === 'Contact Us' ? 'Contact Sales' : (selectedPlanId === plan.id ? 'Selected' : 'Choose Plan')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Button 
          size="lg" 
          onClick={handleProceedToPayment} 
          disabled={!selectedPlanId || isProcessing || APP_PLANS.find(p=>p.id === selectedPlanId)?.price === 'Contact Us'}
          className="min-w-[200px]"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {isProcessing ? 'Processing...' : (APP_PLANS.find(p=>p.id === selectedPlanId)?.id === 'free' ? 'Continue with Starter Plan' : 'Proceed to Payment')}
        </Button>
         <p className="text-xs text-muted-foreground mt-2">
          You can change your plan later. {APP_PLANS.find(p=>p.id === selectedPlanId)?.id !== 'free' && "Secure payment processing."}
        </p>
      </div>
    </div>
  );
}
