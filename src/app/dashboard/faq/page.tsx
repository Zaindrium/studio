
"use client";
// Placeholder - FAQ / Help Page
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LifeBuoy } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><LifeBuoy className="mr-2 h-6 w-6 text-primary"/>FAQ & Help</CardTitle>
        <CardDescription>Find answers to frequently asked questions and get help with using LinkUP.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I create a business card?</AccordionTrigger>
            <AccordionContent>
              Navigate to the main application page. You can select a template, fill in your profile information, and customize the design using the provided tools. Your card preview will update in real-time.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does employee access work?</AccordionTrigger>
            <AccordionContent>
              Administrators can generate unique access codes for employees. Employees use these codes on the "Employee Access" page to verify their identity and set up their accounts within the organization.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I manage multiple teams?</AccordionTrigger>
            <AccordionContent>
              Yes, the Business Dashboard allows you to create and manage multiple teams, assign users to them, and set team-specific templates or permissions.
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4">
            <AccordionTrigger>What are the subscription options?</AccordionTrigger>
            <AccordionContent>
              LinkUP offers various subscription plans tailored to different needs, from personal use to large enterprises. Each plan comes with different limits for users, cards, and features. You can view and manage your subscription from the "License Management" section.
            </AccordionContent>
          </AccordionItem>
          {/* Add more FAQ items here */}
        </Accordion>
      </CardContent>
    </Card>
  );
}
