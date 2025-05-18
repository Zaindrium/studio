
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart, Truck, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function PhysicalCardsPage() {
  const [isLoading, setIsLoading] = React.useState(true); // Simulate loading

  React.useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-4">
           <Skeleton className="h-10 w-36" />
          <Skeleton className="h-40 w-full" />
          <p className="text-center text-muted-foreground">Loading physical card options...</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="flex items-center"><ShoppingCart className="mr-2 h-6 w-6 text-primary"/>Physical Cards</CardTitle>
                <CardDescription>Order and track printed physical cards (e.g., NFC cards) for your organization.</CardDescription>
            </div>
            <Button disabled> {/* TODO: Implement Order Flow */}
                <PlusCircle className="mr-2 h-5 w-5" /> New Card Order
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-8 text-center">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Physical Card Orders - Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
                This section will allow you to order physical NFC-enabled business cards for your staff.
                You'll be able to select card types, quantities, and track your order status.
            </p>
            <Button variant="outline" className="mt-6" disabled>View Card Options</Button>
        </div>
        {/* Placeholder for future content:
            - List of existing orders
            - Tracking information
            - Card design selection for physical print
            - Address management
        */}
      </CardContent>
    </Card>
  );
}
