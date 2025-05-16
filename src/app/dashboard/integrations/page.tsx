
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Briefcase, CalendarDays, MailOpen, Users2, BarChartBig, DatabaseZap, CheckCircle, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from 'lucide-react';

interface IntegrationCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  examples: string[];
}

const integrationCategoriesData: IntegrationCategory[] = [
  {
    id: 'crm',
    name: 'CRM (Customer Relationship Management)',
    icon: Briefcase,
    description: 'Automatically sync contacts collected through LinkUP to your CRM, assign leads, and track interactions.',
    examples: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Pipedrive'],
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    icon: CalendarDays,
    description: 'Allow contacts to book meetings directly from your digital card or easily add follow-up reminders to your calendar.',
    examples: ['Google Calendar', 'Outlook Calendar', 'Calendly', 'SavvyCal'],
  },
  {
    id: 'email_marketing',
    name: 'Email Marketing Platforms',
    icon: MailOpen,
    description: 'Add contacts to your mailing lists and marketing campaigns for targeted follow-ups.',
    examples: ['Mailchimp', 'Constant Contact', 'SendGrid'],
  },
  {
    id: 'team_communication',
    name: 'Team Communication & Collaboration',
    icon: Users2,
    description: 'Notify team members about new important contacts or card updates directly in your communication channels.',
    examples: ['Slack', 'Microsoft Teams'],
  },
  {
    id: 'hr_systems',
    name: 'HR Systems / User Provisioning',
    icon: Briefcase,
    description: 'Streamline employee onboarding by syncing user data from your HR system to automatically create or update digital business cards.',
    examples: ['Workday', 'BambooHR', 'Active Directory / LDAP'],
  },
  {
    id: 'analytics_bi',
    name: 'Analytics & Business Intelligence',
    icon: BarChartBig,
    description: 'Gain deeper insights into card engagement by sending data to your preferred analytics platforms.',
    examples: ['Google Analytics', 'Mixpanel', 'Amplitude'],
  },
   {
    id: 'cloud_storage',
    name: 'Cloud Storage & Asset Management',
    icon: DatabaseZap,
    description: 'Easily use your existing brand assets like logos or background images from your cloud storage.',
    examples: ['Google Drive', 'Dropbox', 'Adobe Creative Cloud'],
  }
];

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | null>(null);
  const [integratedServices, setIntegratedServices] = useState<Set<string>>(new Set());
  const [isProcessingIntegration, setIsProcessingIntegration] = useState(false);

  const handleOpenIntegrationDialog = (category: IntegrationCategory) => {
    setSelectedCategory(category);
    setIsIntegrationDialogOpen(true);
  };

  const handleConfirmIntegration = async () => {
    if (!selectedCategory) return;

    setIsProcessingIntegration(true);
    // Simulate API call for integration
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIntegratedServices(prev => new Set(prev).add(selectedCategory.id));
    toast({
      title: "Integration Successful!",
      description: `Successfully connected to ${selectedCategory.name} services. (Simulation)`,
    });
    setIsProcessingIntegration(false);
    setIsIntegrationDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDisconnect = (categoryId: string, categoryName: string) => {
    setIntegratedServices(prev => {
      const newSet = new Set(prev);
      newSet.delete(categoryId);
      return newSet;
    });
    toast({
      title: "Disconnected",
      description: `Disconnected from ${categoryName} services. (Simulation)`,
      variant: "destructive"
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Puzzle className="mr-2 h-6 w-6 text-primary"/>Integrations</CardTitle>
          <CardDescription>Connect LinkUP with your favorite tools to streamline workflows and enhance productivity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {integrationCategoriesData.map((category) => {
            const CategoryIcon = category.icon;
            const isIntegrated = integratedServices.has(category.id);
            return (
              <Card key={category.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryIcon className="h-7 w-7 mr-3 text-primary" />
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                    </div>
                    {isIntegrated && (
                      <CheckCircle className="h-6 w-6 text-green-500" title="Integrated" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                    <ul className="flex flex-wrap gap-2">
                      {category.examples.map(example => (
                        <li key={example} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{example}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  {isIntegrated ? (
                     <div className="flex w-full justify-between items-center">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2"/> Connected
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnect(category.id, category.name)}>
                            <Settings className="mr-2 h-4 w-4" /> Manage / Disconnect
                        </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleOpenIntegrationDialog(category)}
                    >
                      Connect to {category.name}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
          <p className="text-center text-muted-foreground pt-6">
            More integrations are planned! If you have specific requests, please let our team know.
          </p>
        </CardContent>
      </Card>

      {selectedCategory && (
        <Dialog open={isIntegrationDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setSelectedCategory(null); // Reset selected category when dialog closes
          }
          setIsIntegrationDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <selectedCategory.icon className="mr-2 h-5 w-5 text-primary" />
                Connect to {selectedCategory.name}
              </DialogTitle>
              <DialogDescription className="pt-2">
                This will simulate connecting LinkUP to services in the {selectedCategory.name} category. 
                In a real application, you would be redirected to an authentication flow.
                <br/><br/>
                Example services: {selectedCategory.examples.join(', ')}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isProcessingIntegration}>Cancel</Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={handleConfirmIntegration}
                disabled={isProcessingIntegration}
              >
                {isProcessingIntegration ? 'Connecting...' : 'Confirm Connection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
    