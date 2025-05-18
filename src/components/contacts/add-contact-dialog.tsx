
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contactData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddContactDialog({ isOpen, onClose, onSubmit, isSubmitting }: AddContactDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setMessage('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const internalHandleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least Name and Email.",
        variant: "destructive",
      });
      return;
    }
    await onSubmit({ name, email, phone, company, message });
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contact Manually</DialogTitle>
          <DialogDescription>
            Enter the details for the contact you want to add.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={internalHandleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="manual-contact-name">Full Name *</Label>
              <Input id="manual-contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contact's Name" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manual-contact-email">Email *</Label>
              <Input id="manual-contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manual-contact-phone">Phone (Optional)</Label>
              <Input id="manual-contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact's Phone Number" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manual-contact-company">Company (Optional)</Label>
              <Input id="manual-contact-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Contact's Company Name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manual-contact-message">Message/Notes (Optional)</Label>
              <Textarea id="manual-contact-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
