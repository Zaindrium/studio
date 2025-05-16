
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Palette, Share2, Users } from 'lucide-react';

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingDialog({ isOpen, onClose }: OnboardingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <CheckCircle className="h-7 w-7 mr-2 text-primary" />
            Welcome to LinkUP!
          </DialogTitle>
          <DialogDescription className="pt-2">
            The smartest way to create, share, and manage your digital business cards. Network smarter, not harder.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Key Features:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Palette className="h-5 w-5 mr-3 mt-1 text-accent flex-shrink-0" />
              <div>
                <span className="font-medium">Easy Design:</span> Craft stunning digital cards in minutes with customizable templates and AI assistance.
              </div>
            </li>
            <li className="flex items-start">
              <Share2 className="h-5 w-5 mr-3 mt-1 text-accent flex-shrink-0" />
              <div>
                <span className="font-medium">Instant Sharing:</span> Share your card seamlessly via QR codes, NFC, email, or SMS.
              </div>
            </li>
            <li className="flex items-start">
              <Users className="h-5 w-5 mr-3 mt-1 text-accent flex-shrink-0" />
              <div>
                <span className="font-medium">Smart Management:</span> Keep your network organized and never lose a contact again.
              </div>
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">Get Started!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
