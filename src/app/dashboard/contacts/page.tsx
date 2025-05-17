
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
import { // Keep DialogTrigger and DialogClose for now, as they are used outside the lazy-loaded component
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
import { useToast } from '@/hooks/use-toast'; // Assuming useToast is small or used elsewhere
import { formatDistanceToNow } from 'date-fns';
import { // Keep AlertDialogCancel and AlertDialogAction for now
 AlertDialogAction,
 AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// Dynamically import components that are not immediately needed
const LazyAddContactDialog = React.lazy(() => import('@/components/contacts/add-contact-dialog'));
const LazyDeleteContactAlert = React.lazy(() => import('@/components/contacts/delete-contact-alert'));
const LazyViewMessageAlert = React.lazy(() => import('@/components/contacts/view-message-alert')); // Assuming you might want a dedicated modal later

const CONTACTS_STORAGE_KEY = 'linkup_collected_contacts';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isAddManualContactDialogOpen, setIsAddManualContactDialogOpen] = useState(false); // Keep state here
  const [isSubmittingManualContact, setIsSubmittingManualContact] = useState(false);

  const [isDeleteContactAlertOpen, setIsDeleteContactAlertOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ContactInfo | null>(null);


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

  const confirmDeleteContact = (contact: ContactInfo) => {
    setContactToDelete(contact);
    setIsDeleteContactAlertOpen(true);
  };

  const handleDeleteContact = () => {
    if(!contactToDelete) return;
    try {
      const updatedContacts = contacts.filter(c => c.id !== contactToDelete.id);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      toast({
        title: "Contact Deleted",
        description: `Contact "${contactToDelete.name}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting contact from localStorage:", error);
      toast({
        title: "Error Deleting Contact",
        description: "Could not remove the contact. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsDeleteContactAlertOpen(false);
        setContactToDelete(null);
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
    setIsAddManualContactDialogOpen(true); // Only open the dialog
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
      submittedFromCardId: 'manual_entry', 
      submittedAt: new Date().toISOString(),
    };

    try {
      const updatedContacts = [newContact, ...contacts]; 
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
                           <span className="sr-only">Contact Actions for {contact.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem disabled> 
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {contact.message && 
                          <DropdownMenuItem onClick={() => alert(`Message from ${contact.name}:\n\n${contact.message}`)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> {/* Consider replacing alert with a modal and lazy loading it */}
                            View Message
                          </DropdownMenuItem>
                        }
                         <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={(e) => {
                                e.preventDefault();
                                confirmDeleteContact(contact);
                            }}
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
        </CardFooter>
      )}

 {/* Dynamically loaded Add Contact Dialog */}
 {isAddManualContactDialogOpen && (
  <React.Suspense fallback={<div>Loading Dialog...</div>}>
  <LazyAddContactDialog
  isOpen={isAddManualContactDialogOpen}
  onClose={() => setIsAddManualContactDialogOpen(false)}
  onSubmit={handleSubmitManualContact}
  isSubmitting={isSubmittingManualContact}
  />
  </React.Suspense>
 )}

 {/* Dynamically loaded Delete Contact Alert Dialog */}
 {isDeleteContactAlertOpen && (
  <React.Suspense fallback={<div>Loading Alert...</div>}>
  <LazyDeleteContactAlert
  isOpen={isDeleteContactAlertOpen}
  onClose={() => setIsDeleteContactAlertOpen(false)}
  onConfirm={handleDeleteContact}
  contactName={contactToDelete?.name} // Pass contact name for context
  />
  </React.Suspense>
 )}
    </Card>
  );
}