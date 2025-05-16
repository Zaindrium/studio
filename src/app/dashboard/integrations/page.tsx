
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Puzzle, Briefcase, CalendarDays, MailOpen, Users2, BarChartBig, DatabaseZap } from 'lucide-react';

const integrationCategories = [
  {
    name: 'CRM (Customer Relationship Management)',
    icon: Briefcase,
    description: 'Automatically sync contacts collected through LinkUP to your CRM, assign leads, and track interactions.',
    examples: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Pipedrive'],
  },
  {
    name: 'Calendar & Scheduling',
    icon: CalendarDays,
    description: 'Allow contacts to book meetings directly from your digital card or easily add follow-up reminders to your calendar.',
    examples: ['Google Calendar', 'Outlook Calendar', 'Calendly', 'SavvyCal'],
  },
  {
    name: 'Email Marketing Platforms',
    icon: MailOpen,
    description: 'Add contacts to your mailing lists and marketing campaigns for targeted follow-ups.',
    examples: ['Mailchimp', 'Constant Contact', 'SendGrid (for transactional emails)'],
  },
  {
    name: 'Team Communication & Collaboration',
    icon: Users2,
    description: 'Notify team members about new important contacts or card updates directly in your communication channels.',
    examples: ['Slack', 'Microsoft Teams'],
  },
  {
    name: 'HR Systems / User Provisioning',
    icon: Briefcase, // Could use a more specific icon if available
    description: 'Streamline employee onboarding by syncing user data from your HR system to automatically create or update digital business cards (for Business Accounts).',
    examples: ['Workday', 'BambooHR', 'Active Directory / LDAP'],
  },
  {
    name: 'Analytics & Business Intelligence',
    icon: BarChartBig,
    description: 'Gain deeper insights into card engagement by sending data to your preferred analytics platforms.',
    examples: ['Google Analytics (for public card views)', 'Mixpanel / Amplitude (for in-app user behavior)'],
  },
   {
    name: 'Cloud Storage & Asset Management',
    icon: DatabaseZap,
    description: 'Easily use your existing brand assets like logos or background images from your cloud storage.',
    examples: ['Google Drive', 'Dropbox', 'Adobe Creative Cloud'],
  }
];

export default function IntegrationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Puzzle className="mr-2 h-6 w-6 text-primary"/>Integrations</CardTitle>
        <CardDescription>Connect LinkUP with your favorite tools to streamline workflows, enhance productivity, and enrich your digital card experience.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {integrationCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.name} className="p-4 border rounded-lg shadow-sm bg-secondary/20">
              <div className="flex items-center mb-2">
                <CategoryIcon className="h-6 w-6 mr-3 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{category.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                <ul className="flex flex-wrap gap-2">
                  {category.examples.map(example => (
                    <li key={example} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{example}</li>
                  ))}
                </ul>
              </div>
              {/* Placeholder for future "Connect" or "Learn More" buttons */}
              {/* <Button variant="outline" size="sm" className="mt-3">Learn More</Button> */}
            </div>
          );
        })}
        <p className="text-center text-muted-foreground pt-6">
          More integrations are planned! If you have specific requests, please let our team know.
        </p>
      </CardContent>
    </Card>
  );
}
