
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Contact as ContactIcon, Search, MoreVertical, Trash2, Eye, PlusCircle, MessageSquare } from 'lucide-react';
import type { ContactInfo } from '@/lib/app-types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const CONTACTS_STORAGE_KEY = 'linkup_collected_contacts';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isAddManualContactDialogOpen, setIsAddManualContactDialogOpen] = useState(false);
  const [manualContactName, setManualContactName] = useState('');
  const [manualContactEmail, setManualContactEmail] = useState('');
  const [manualContactPhone, setManualContactPhone] = useState('');
  const [manualContactCompany, setManualContactCompany] = useState('');
  const [manualContactMessage, setManualContactMessage] = useState('');
  const [isSubmittingManualContact, setIsSubmittingManualContact] = useState(false);

  useEffect(() => {
    try {
      const storedContactsRaw = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (storedContactsRaw) {
        const parsedContacts: ContactInfo[] = JSON.parse(storedContactsRaw);
        parsedContacts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setContacts(parsedContacts);
      }
    } catch (error) {
      console.error("Error loading contacts from localStorage:", error);
      toast({
        title: "Error Loading Contacts",
        description: "Could not retrieve contact list from local storage.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [contacts, searchTerm]);

  const handleDeleteContact = (contactId: string) => {
    if (!window.confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
        return;
    }
    try {
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      toast({
        title: "Contact Deleted",
        description: "The contact has been removed from your list.",
      });
    } catch (error) {
      console.error("Error deleting contact from localStorage:", error);
      toast({
        title: "Error Deleting Contact",
        description: "Could not remove the contact. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatSubmittedDate = (dateString: string) => {
    try {
      return `${formatDistanceToNow(new Date(dateString))} ago`;
    } catch (e) {
      return "Invalid date";
    }
  };

  const handleOpenManualAddDialog = () => {
    setManualContactName('');
    setManualContactEmail('');
    setManualContactPhone('');
    setManualContactCompany('');
    setManualContactMessage('');
    setIsAddManualContactDialogOpen(true);
  };

  const handleSubmitManualContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualContactName.trim() || !manualContactEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least Name and Email for the contact.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmittingManualContact(true);

    const newContact: ContactInfo = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: manualContactName,
      email: manualContactEmail,
      phone: manualContactPhone || undefined,
      company: manualContactCompany || undefined,
      message: manualContactMessage || undefined,
      submittedFromCardId: 'manual_entry', // Indicate it was a manual entry
      submittedAt: new Date().toISOString(),
    };

    try {
      const updatedContacts = [newContact, ...contacts]; // Add to beginning for recent first
      updatedContacts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      setContacts(updatedContacts);

      toast({
        title: "Contact Added Manually!",
        description: `${manualContactName} has been added to your contacts.`,
      });
      setIsAddManualContactDialogOpen(false);
    } catch (e) {
      console.error("Error saving manual contact to localStorage:", e);
      toast({
        title: "Submission Error",
        description: "Could not save the contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingManualContact(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center"><ContactIcon className="mr-2 h-6 w-6 text-primary"/>Collected Contacts</CardTitle>
            <CardDescription>Contacts received from your digital business cards or added manually. Stored locally in your browser.</CardDescription>
          </div>
          <Button onClick={handleOpenManualAddDialog}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add Contact Manually
          </Button>
        </div>
        <div className="mt-4 relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts by name, email, company..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.company || 'N/A'}</TableCell>
                  <TableCell>{contact.phone || 'N/A'}</TableCell>
                  <TableCell title={new Date(contact.submittedAt).toLocaleString()}>{formatSubmittedDate(contact.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">Contact Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem disabled> {/* Placeholder for future "View Full Details" modal */}
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {contact.message && 
                          <DropdownMenuItem onClick={() => alert(`Message from ${contact.name}:\n\n${contact.message}`)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            View Message
                          </DropdownMenuItem>
                        }
                         <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {contacts.length === 0 ? "No contacts collected yet. Click 'Add Contact Manually' to start." : `No contacts found for "${searchTerm}".`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {filteredContacts.length > 10 && ( 
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredContacts.length} of {contacts.length} contacts.</p>
          {/* TODO: Add pagination if list becomes very long */}
        </CardFooter>
      )}

      {/* Manual Add Contact Dialog */}
      <Dialog open={isAddManualContactDialogOpen} onOpenChange={setIsAddManualContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact Manually</DialogTitle>
            <DialogDescription>
              Enter the details for the new contact.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitManualContact}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="manual-contact-name">Full Name *</Label>
                <Input id="manual-contact-name" value={manualContactName} onChange={(e) => setManualContactName(e.target.value)} placeholder="Contact's Name" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="manual-contact-email">Email *</Label>
                <Input id="manual-contact-email" type="email" value={manualContactEmail} onChange={(e) => setManualContactEmail(e.target.value)} placeholder="contact.email@example.com" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="manual-contact-phone">Phone (Optional)</Label>
                <Input id="manual-contact-phone" type="tel" value={manualContactPhone} onChange={(e) => setManualContactPhone(e.target.value)} placeholder="Contact's Phone Number" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="manual-contact-company">Company (Optional)</Label>
                <Input id="manual-contact-company" value={manualContactCompany} onChange={(e) => setManualContactCompany(e.target.value)} placeholder="Contact's Company Name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="manual-contact-message">Message/Notes (Optional)</Label>
                <Textarea id="manual-contact-message" value={manualContactMessage} onChange={(e) => setManualContactMessage(e.target.value)} placeholder="Any relevant notes..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmittingManualContact}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmittingManualContact}>
                {isSubmittingManualContact ? 'Adding...' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
