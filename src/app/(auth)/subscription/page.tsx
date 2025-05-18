
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Star, Users, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentPlan, type PlanId } from '@/hooks/use-current-plan';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'free' as PlanId,
    name: 'Personal Free',
    price: '$0',
    frequency: '/ month',
    features: ['Up to 5 Cards', 'Basic Analytics', 'Standard Templates'],
    userLimit: 1,
    isBusiness: false,
  },
  {
    id: 'starter' as PlanId,
    name: 'Business Starter',
    price: '$19',
    frequency: '/ month',
    features: ['Up to 50 Cards', 'Up to 5 Users', 'Advanced Analytics', 'Custom Templates', 'Team Management'],
    userLimit: 5,
    isBusiness: true,
  },
  {
    id: 'growth' as PlanId,
    name: 'Business Growth',
    price: 'R115',
    frequency: '/ month',
    features: ['Up to 200 Cards', 'Up to 20 Users', 'All Starter Features', 'Priority Support', 'Batch Card Generation'],
    userLimit: 20,
    isBusiness: true,
    popular: true,
  },
  {
    id: 'enterprise' as PlanId,
    name: 'Business Enterprise',
    price: 'Contact Us',
    frequency: '',
    features: ['Unlimited Cards & Users', 'All Growth Features', 'Dedicated Account Manager', 'API Access', 'Custom Integrations'],
    userLimit: Infinity,
    isBusiness: true,
  },
];

export default function SubscriptionPage() {
  // useCurrentPlan now gets plan from Firestore via AuthContext
  const { currentPlan: activePlanIdFromAuth, setCurrentPlan: setActivePlanInFirestore, isLoading: isPlanLoading } = useCurrentPlan();
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isPlanLoading && activePlanIdFromAuth) {
      setSelectedPlanId(activePlanIdFromAuth);
    } else if (!isPlanLoading && !activePlanIdFromAuth) {
        // If no plan is set in AuthContext (e.g., new user before Firestore write), default selection
        setSelectedPlanId(plans.find(p => p.id === 'growth')?.id || plans[1].id); 
    }
  }, [activePlanIdFromAuth, isPlanLoading]);


  const handleProceedToPayment = async () => {
    if (!selectedPlanId) return;
    setIsProcessing(true);
    
    const selectedPlanDetails = plans.find(p => p.id === selectedPlanId);

    try {
      await setActivePlanInFirestore(selectedPlanId); // Update plan in Firestore via hook
      toast({
        title: `Plan Selected: ${selectedPlanDetails?.name || 'Selected Plan'}`,
        description: selectedPlanId === 'free' ? "You're now on the Free plan!" : "Your subscription has been updated. Redirecting...",
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
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">Select the perfect plan for your personal or business needs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
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
          disabled={!selectedPlanId || isProcessing || plans.find(p=>p.id === selectedPlanId)?.price === 'Contact Us'}
          className="min-w-[200px]"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {isProcessing ? 'Processing...' : (selectedPlanId === 'free' ? 'Start with Free Plan' : 'Proceed to Payment')}
        </Button>
         <p className="text-xs text-muted-foreground mt-2">
          Secure payment processing. You can change your plan later.
        </p>
      </div>
    </div>
  );
}
