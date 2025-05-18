
"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ViewMessageAlertProps {
  isOpen: boolean;
  onClose: () => void;
  contactName?: string;
  message?: string;
}

export default function ViewMessageAlert({ 
  isOpen, 
  onClose, 
  contactName = "Contact", 
  message = "No message provided." 
}: ViewMessageAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Message from {contactName}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap py-4">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
