
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Star, Users, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
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
    price: '$49',
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

export default function SubscriptionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[1].id); // Default to Business Starter
  const [isLoading, setIsLoading] = useState(false);

  // This page would be shown after business signup if subscription is required.
  // It assumes the account type is 'business'.

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlanId) return;
    setIsLoading(true);
    // Placeholder for actual subscription/payment processing
    console.log("Proceeding to payment for plan:", selectedPlanId);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    // On success, redirect to dashboard or next step.
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">Select the perfect plan for your business needs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.filter(plan => plan.isBusiness).map((plan) => (
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
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSelectPlan(plan.id)}
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
          disabled={!selectedPlanId || isLoading || plans.find(p=>p.id === selectedPlanId)?.price === 'Contact Us'}
          className="min-w-[200px]"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
         <p className="text-xs text-muted-foreground mt-2">
          Secure payment processing. You can change your plan later.
        </p>
      </div>
    </div>
  );
}
