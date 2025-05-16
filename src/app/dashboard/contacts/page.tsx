
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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

const CONTACTS_STORAGE_KEY = 'linkup_collected_contacts';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedContactsRaw = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (storedContactsRaw) {
        const parsedContacts: ContactInfo[] = JSON.parse(storedContactsRaw);
        // Sort by most recent first
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
    // Confirm deletion
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center"><ContactIcon className="mr-2 h-6 w-6 text-primary"/>Collected Contacts</CardTitle>
            <CardDescription>Contacts received from your digital business cards. Stored locally in your browser.</CardDescription>
          </div>
          <Button disabled> {/* Placeholder for future Add Manually feature */}
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
                        <DropdownMenuItem disabled> {/* Placeholder */}
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
                    {contacts.length === 0 ? "No contacts collected yet." : `No contacts found for "${searchTerm}".`}
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
    </Card>
  );
}
