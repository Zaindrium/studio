
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Briefcase, CalendarDays, MailOpen, Users2, BarChartBig, DatabaseZap, CheckCircle, Settings, Link as LinkIconLucide } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface SoftwareExample {
  id: string;
  name: string;
  // icon?: LucideIcon; // We could try to assign a generic icon later if needed
}

interface IntegrationCategory {
  id: string; // e.g., 'crm', 'calendar'
  name: string; // e.g., 'CRM (Customer Relationship Management)'
  icon: LucideIcon;
  description: string;
  examples: SoftwareExample[];
}

const integrationCategoriesData: IntegrationCategory[] = [
  {
    id: 'crm',
    name: 'CRM (Customer Relationship Management)',
    icon: Briefcase,
    description: 'Automatically sync contacts collected through LinkUP to your CRM, assign leads, and track interactions.',
    examples: [
      { id: 'salesforce', name: 'Salesforce' },
      { id: 'hubspot', name: 'HubSpot' },
      { id: 'zoho_crm', name: 'Zoho CRM' },
      { id: 'pipedrive', name: 'Pipedrive' },
    ],
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    icon: CalendarDays,
    description: 'Allow contacts to book meetings directly from your digital card or easily add follow-up reminders to your calendar.',
    examples: [
      { id: 'google_calendar', name: 'Google Calendar' },
      { id: 'outlook_calendar', name: 'Outlook Calendar' },
      { id: 'calendly', name: 'Calendly' },
      { id: 'savvycal', name: 'SavvyCal' },
    ],
  },
  {
    id: 'email_marketing',
    name: 'Email Marketing Platforms',
    icon: MailOpen,
    description: 'Add contacts to your mailing lists and marketing campaigns for targeted follow-ups.',
    examples: [
      { id: 'mailchimp', name: 'Mailchimp' },
      { id: 'constant_contact', name: 'Constant Contact' },
      { id: 'sendgrid', name: 'SendGrid' },
    ],
  },
  {
    id: 'team_communication',
    name: 'Team Communication & Collaboration',
    icon: Users2,
    description: 'Notify team members about new important contacts or card updates directly in your communication channels.',
    examples: [
        { id: 'slack', name: 'Slack'},
        { id: 'ms_teams', name: 'Microsoft Teams'}
    ],
  },
  {
    id: 'hr_systems',
    name: 'HR Systems / User Provisioning',
    icon: Briefcase, // Re-using icon for demo
    description: 'Streamline employee onboarding by syncing user data from your HR system to automatically create or update digital business cards.',
    examples: [
        { id: 'workday', name: 'Workday'},
        { id: 'bamboohr', name: 'BambooHR'},
        { id: 'active_directory', name: 'Active Directory / LDAP'}
    ],
  },
  {
    id: 'analytics_bi',
    name: 'Analytics & Business Intelligence',
    icon: BarChartBig,
    description: 'Gain deeper insights into card engagement by sending data to your preferred analytics platforms.',
    examples: [
        { id: 'google_analytics', name: 'Google Analytics'},
        { id: 'mixpanel', name: 'Mixpanel'},
        { id: 'amplitude', name: 'Amplitude'}
    ],
  },
   {
    id: 'cloud_storage',
    name: 'Cloud Storage & Asset Management',
    icon: DatabaseZap,
    description: 'Easily use your existing brand assets like logos or background images from your cloud storage.',
    examples: [
        { id: 'google_drive', name: 'Google Drive'},
        { id: 'dropbox', name: 'Dropbox'},
        { id: 'adobe_cc', name: 'Adobe Creative Cloud'}
    ],
  }
];

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [selectedCategoryForDialog, setSelectedCategoryForDialog] = useState<IntegrationCategory | null>(null);
  const [selectedSoftwareForDialog, setSelectedSoftwareForDialog] = useState<SoftwareExample | null>(null);
  
  // Stores which specific software is integrated for each category
  // e.g., { crm: 'salesforce', calendar: 'google_calendar' }
  const [integratedServices, setIntegratedServices] = useState<Record<string, string>>({});
  const [isProcessingIntegration, setIsProcessingIntegration] = useState(false);

  const handleOpenIntegrationDialog = (category: IntegrationCategory, software: SoftwareExample) => {
    setSelectedCategoryForDialog(category);
    setSelectedSoftwareForDialog(software);
    setIsIntegrationDialogOpen(true);
  };

  const handleConfirmIntegration = async () => {
    if (!selectedCategoryForDialog || !selectedSoftwareForDialog) return;

    setIsProcessingIntegration(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    setIntegratedServices(prev => ({
      ...prev,
      [selectedCategoryForDialog.id]: selectedSoftwareForDialog.id,
    }));
    toast({
      title: "Integration Successful!",
      description: `Successfully connected to ${selectedSoftwareForDialog.name}. (Simulation)`,
    });
    setIsProcessingIntegration(false);
    setIsIntegrationDialogOpen(false);
    setSelectedCategoryForDialog(null);
    setSelectedSoftwareForDialog(null);
  };

  const handleDisconnect = (categoryId: string, softwareName: string) => {
    setIntegratedServices(prev => {
      const newState = { ...prev };
      delete newState[categoryId];
      return newState;
    });
    toast({
      title: "Disconnected",
      description: `Disconnected from ${softwareName}. (Simulation)`,
      variant: "destructive"
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Puzzle className="mr-2 h-6 w-6 text-primary"/>Integrations</CardTitle>
          <CardDescription>Connect LinkUP with your favorite tools to streamline workflows and enhance productivity. Select one service per category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {integrationCategoriesData.map((category) => {
            const CategoryIcon = category.icon;
            const activeIntegrationInThisCategory = integratedServices[category.id];
            return (
              <Card key={category.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center">
                    <CategoryIcon className="h-7 w-7 mr-3 text-primary" />
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                  </div>
                   <p className="text-sm text-muted-foreground pt-1">{category.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Available Services:</h4>
                  <ul className="space-y-2">
                    {category.examples.map(software => {
                      const isThisSoftwareConnected = activeIntegrationInThisCategory === software.id;
                      const canConnectThisSoftware = !activeIntegrationInThisCategory || isThisSoftwareConnected;
                      
                      return (
                        <li key={software.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/20">
                          <div className="flex items-center">
                            {isThisSoftwareConnected && <CheckCircle className="h-5 w-5 mr-2 text-green-500" />}
                            <span className={cn("text-sm", isThisSoftwareConnected && "font-semibold")}>{software.name}</span>
                          </div>
                          {isThisSoftwareConnected ? (
                            <Button variant="outline" size="sm" onClick={() => handleDisconnect(category.id, software.name)}>
                              <LinkIconLucide className="mr-2 h-4 w-4 text-destructive" /> Disconnect
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleOpenIntegrationDialog(category, software)}
                              disabled={!canConnectThisSoftware}
                              title={!canConnectThisSoftware ? `Disconnect '${integratedServices[category.id] ? category.examples.find(ex => ex.id === integratedServices[category.id])?.name : ''}' first` : `Connect to ${software.name}`}
                            >
                              <LinkIconLucide className="mr-2 h-4 w-4" /> Connect
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
                 {activeIntegrationInThisCategory && (
                    <CardFooter className="text-xs text-muted-foreground justify-center pt-2">
                       Only one service can be active per category. Currently connected: {category.examples.find(ex => ex.id === activeIntegrationInThisCategory)?.name}.
                    </CardFooter>
                )}
              </Card>
            );
          })}
          <p className="text-center text-muted-foreground pt-6">
            More integrations are planned! If you have specific requests, please let our team know.
          </p>
        </CardContent>
      </Card>

      {selectedCategoryForDialog && selectedSoftwareForDialog && (
        <Dialog open={isIntegrationDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setSelectedCategoryForDialog(null);
            setSelectedSoftwareForDialog(null);
          }
          setIsIntegrationDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <selectedCategoryForDialog.icon className="mr-2 h-5 w-5 text-primary" />
                Connect to {selectedSoftwareForDialog.name}
              </DialogTitle>
              <DialogDescription className="pt-2">
                This will simulate connecting LinkUP to {selectedSoftwareForDialog.name} (part of the {selectedCategoryForDialog.name} category). 
                In a real application, you would be redirected to an authentication flow.
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
    
