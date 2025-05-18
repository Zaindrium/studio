
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function TemplatesPage() {
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
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-36" />
          </div>
          <Skeleton className="h-40 w-full" />
          <p className="text-center text-muted-foreground">Loading templates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-6 w-6 text-primary"/>Card Templates</CardTitle>
            <CardDescription>Create, edit, and manage reusable card templates for your organization or for specific teams.</CardDescription>
          </div>
          <Button disabled> {/* TODO: Implement Add Template Dialog */}
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Template
          </Button>
        </div>
        <div className="mt-4 relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates by name..." 
            className="pl-10"
            disabled // TODO: Implement search
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Template Management Coming Soon</h3>
          <p className="text-muted-foreground mt-2">
            This section will allow you to design and manage standardized digital business card templates.
            You'll be able to create new templates, edit existing ones, and assign them for use across your organization.
          </p>
          <Button variant="outline" className="mt-6" disabled>View Example Templates</Button>
        </div>
      </CardContent>
    </Card>
  );
}
