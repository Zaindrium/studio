
"use client";

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
        <Accordion type="single" collapsible className="w-full space-y-2">
          
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I create my first digital business card?</AccordionTrigger>
            <AccordionContent>
              For personal accounts, navigate to the "Editor" page (usually the main page after login). You'll see a profile form and design options. Fill in your details, choose a layout, colors, and upload a profile picture. The preview updates in real-time!
              For business accounts, administrators can create cards for users or allow users to create their own based on company templates.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How can I share my digital card?</AccordionTrigger>
            <AccordionContent>
              LinkUP offers multiple ways to share:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>QR Code:</strong> Display your card's QR code for others to scan.</li>
                <li><strong>NFC (Near Field Communication):</strong> Tap your NFC-enabled phone to another NFC-enabled device to share your card URL. (Requires browser support, e.g., Chrome on Android).</li>
                <li><strong>Shareable Link:</strong> Copy your unique card URL and paste it into emails, messages, or social media.</li>
                <li><strong>Email/SMS:</strong> Use the built-in options to quickly send your card link via email or SMS.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What's the difference between a Personal and Business account?</AccordionTrigger>
            <AccordionContent>
              <strong>Personal accounts</strong> are designed for individuals to create and manage their own digital business card.
              <strong>Business accounts</strong> offer advanced features for organizations, including:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Team management and user provisioning.</li>
                <li>Centralized card management and branding control.</li>
                <li>Organizational analytics.</li>
                <li>Access to premium features like batch card generation and integrations (depending on the subscription plan).</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>How does employee access work for Business accounts?</AccordionTrigger>
            <AccordionContent>
              Administrators of a Business account can invite employees to join the organization. This typically involves generating a unique access code for each employee. The employee uses this code on the "Employee Access" page to set up their account and password, linking them to the organization.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I customize the design of my card extensively?</AccordionTrigger>
            <AccordionContent>
              Yes! You can customize layouts, color schemes, upload profile photos, and background images. The AI Design Assistant can also provide suggestions for content, layout, and colors based on your profile. Business accounts may have options for centrally managed templates to ensure brand consistency.
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="item-6">
            <AccordionTrigger>How do I manage my subscription plan?</AccordionTrigger>
            <AccordionContent>
              You can view your current subscription details and explore other plan options in the "License Management" section of the Business Dashboard. For new users or those on a free plan, the "Subscription" page (accessible during signup or from upgrade prompts) allows you to choose a plan.
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="item-7">
            <AccordionTrigger>What if my QR code isn't scanning or NFC isn't working?</AccordionTrigger>
            <AccordionContent>
              <strong>For QR Codes:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Ensure the QR code is clear and not obscured.</li>
                <li>Try scanning from a different distance or angle.</li>
                <li>Make sure your camera lens is clean.</li>
                <li>Check that the URL associated with the QR code is correct and active.</li>
              </ul>
               <strong>For NFC:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Ensure NFC is enabled on both your device and the recipient's device.</li>
                <li>Locate the NFC antenna on your phone (usually on the back, near the top or center).</li>
                <li>Tap the devices back-to-back, holding them steady for a moment.</li>
                <li>WebNFC for writing to tags is primarily supported by Chrome on Android. Ensure your browser supports this feature if you're trying to write to a tag.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-8">
            <AccordionTrigger>How are my collected contacts stored?</AccordionTrigger>
            <AccordionContent>
              When someone fills out the "Connect" form on your public digital card, their details (name, email, etc.) are currently stored locally in your browser's storage. You can view these contacts in the "Contacts" section of your Business Dashboard. For production use, this data would typically be synced to a secure backend database.
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}
