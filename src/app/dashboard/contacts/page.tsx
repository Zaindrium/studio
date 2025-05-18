
"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from '@/components/ui/skeleton';

const LazyAddContactDialog = React.lazy(() => import('@/components/contacts/add-contact-dialog'));
const LazyDeleteContactAlert = React.lazy(() => import('@/components/contacts/delete-contact-alert'));
const LazyViewMessageAlert = React.lazy(() => import('@/components/contacts/view-message-alert'));

const CONTACTS_STORAGE_KEY = 'linkup_collected_contacts';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const [isAddManualContactDialogOpen, setIsAddManualContactDialogOpen] = useState(false);
  const [isSubmittingManualContact, setIsSubmittingManualContact] = useState(false);

  const [isDeleteContactAlertOpen, setIsDeleteContactAlertOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ContactInfo | null>(null);

  const [isViewMessageAlertOpen, setIsViewMessageAlertOpen] = useState(false);
  const [contactToViewMessage, setContactToViewMessage] = useState<ContactInfo | null>(null);

  useEffect(() => {
    setIsLoadingContacts(true);
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
    } finally {
        setIsLoadingContacts(false);
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

  const handleOpenViewMessageDialog = (contact: ContactInfo) => {
    setContactToViewMessage(contact);
    setIsViewMessageAlertOpen(true);
  };
  
  const formatSubmittedDate = (dateString: string | Date) => {
    try {
      return `${formatDistanceToNow(new Date(dateString))} ago`;
    } catch (e) {
      return "Invalid date";
    }
  };

  const handleOpenManualAddDialog = () => {
    setIsAddManualContactDialogOpen(true);
  };

  const handleSubmitManualContact = async (data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
  }) => {
    setIsSubmittingManualContact(true);
    const newContact: ContactInfo = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      company: data.company || undefined,
      message: data.message || undefined,
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
        description: `${data.name} has been added to your contacts.`,
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

  if (isLoadingContacts) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-1/3 mb-4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

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
                          <DropdownMenuItem onClick={() => handleOpenViewMessageDialog(contact)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
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

    <Suspense fallback={<div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Skeleton className="w-11/12 max-w-md h-96" /></div>}>
      {isAddManualContactDialogOpen && (
        <LazyAddContactDialog
          isOpen={isAddManualContactDialogOpen}
          onClose={() => setIsAddManualContactDialogOpen(false)}
          onSubmit={handleSubmitManualContact}
          isSubmitting={isSubmittingManualContact}
        />
      )}
    </Suspense>

    <Suspense fallback={<div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Skeleton className="w-11/12 max-w-md h-48" /></div>}>
      {isDeleteContactAlertOpen && contactToDelete && (
        <LazyDeleteContactAlert
          isOpen={isDeleteContactAlertOpen}
          onClose={() => setIsDeleteContactAlertOpen(false)}
          onConfirm={handleDeleteContact}
          contactName={contactToDelete.name} 
        />
      )}
    </Suspense>

    <Suspense fallback={<div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50"><Skeleton className="w-11/12 max-w-md h-60" /></div>}>
      {isViewMessageAlertOpen && contactToViewMessage && (
        <LazyViewMessageAlert
            isOpen={isViewMessageAlertOpen}
            onClose={() => setIsViewMessageAlertOpen(false)}
            contactName={contactToViewMessage.name}
            message={contactToViewMessage.message}
        />
      )}
    </Suspense>
    </Card>
  );
}
