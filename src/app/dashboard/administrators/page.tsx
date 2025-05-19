
"use client";

import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, PlusCircle, Search, Edit, Trash2, MoreVertical, Send, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { AdminUser, UserStatus } from '@/lib/app-types'; 
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, Timestamp, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';


// Dynamically import Dialog and AlertDialog
const LazyDialog = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.Dialog })));
const LazyDialogContent = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogContent })));
const LazyDialogHeader = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogHeader })));
const LazyDialogTitle = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogTitle })));
const LazyDialogDescription = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogDescription })));
const LazyDialogFooter = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogFooter })));
const LazyDialogClose = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.DialogClose })));

const LazyAlertDialog = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialog })));
const LazyAlertDialogContent = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogContent })));
const LazyAlertDialogHeader = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogHeader })));
const LazyAlertDialogTitle = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogTitle })));
const LazyAlertDialogDescription = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogDescription })));
const LazyAlertDialogFooter = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogFooter })));
const LazyAlertDialogCancel = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogCancel })));
const LazyAlertDialogAction = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogAction })));


const initialNewAdminState: Partial<AdminUser> = {
    name: '',
    email: '',
    role: 'Admin', 
    status: 'Invited',
};

export default function AdministratorsPage() {
  const { companyId, loading: authLoading, adminListCache, fetchAndCacheAdmins } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isInviteAdminDialogOpen, setIsInviteAdminDialogOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState<Partial<AdminUser>>(initialNewAdminState);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isDeleteAdminAlertOpen, setIsDeleteAdminAlertOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);


  useEffect(() => {
    if (!authLoading && companyId) {
        if (!adminListCache) {
            fetchAndCacheAdmins(companyId).finally(() => setIsLoadingAdmins(false));
        } else {
            setIsLoadingAdmins(false);
        }
    } else if (!authLoading && !companyId) {
        setIsLoadingAdmins(false);
    }
  }, [authLoading, companyId, adminListCache, fetchAndCacheAdmins]);


  const filteredAdmins = useMemo(() => {
    if (!adminListCache) return [];
    return adminListCache.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [adminListCache, searchTerm]);

  const handleOpenInviteAdminDialog = (adminToEdit: AdminUser | null = null) => {
    if (adminToEdit) {
      setEditingAdmin(adminToEdit);
      setNewAdminForm({
        name: adminToEdit.name,
        email: adminToEdit.email, // Email not editable in this form
        role: adminToEdit.role, 
        status: adminToEdit.status, 
      });
    } else {
      setEditingAdmin(null);
      setNewAdminForm(initialNewAdminState);
    }
    setIsInviteAdminDialogOpen(true);
  };
  
  const handleFormChange = (field: keyof Partial<AdminUser>, value: string | UserStatus) => {
    setNewAdminForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newAdminForm.name?.trim() || !newAdminForm.email?.trim()) {
        toast({ title: "Missing Information", description: "Name and Email are required.", variant: "destructive" });
        return;
    }
    if (!companyId) {
        toast({ title: "Error", description: "Company context not available.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    const adminDataToSave: Partial<AdminUser> = {
        name: newAdminForm.name,
        email: newAdminForm.email,
        role: newAdminForm.role || 'Admin',
        status: editingAdmin ? newAdminForm.status : 'Invited',
        companyId: companyId, // Ensure companyId is part of the data
    };

    try {
        if (editingAdmin) {
            const adminDocRef = doc(db, `companies/${companyId}/admins`, editingAdmin.id);
            await updateDoc(adminDocRef, { ...adminDataToSave, updatedAt: serverTimestamp() });
            toast({ title: "Administrator Updated", description: `${newAdminForm.name} has been updated.` });
        } else {
            // For new admins, we typically don't create Firebase Auth users here, just the record.
            // Firebase Auth user creation would happen via a separate invitation flow ideally.
            const adminsCollectionRef = collection(db, `companies/${companyId}/admins`);
            await addDoc(adminsCollectionRef, { 
                ...adminDataToSave, 
                companyName: (await getDoc(doc(db, "companies", companyId))).data()?.name || 'Unknown Company',
                emailVerified: false, // Assume not verified until they accept invite (if applicable)
                createdAt: serverTimestamp(), 
                updatedAt: serverTimestamp() 
            });
            toast({ title: "Administrator Invited", description: `${newAdminForm.name} has been invited.` });
        }
        setIsInviteAdminDialogOpen(false);
        await fetchAndCacheAdmins(companyId);
    } catch (error: any) {
        console.error("Error saving admin:", error);
        if (error.code === 'permission-denied') {
            toast({ title: "Permission Denied", description: "You do not have permission to save admin details. Please check your Firestore Security Rules.", variant: "destructive", duration: 7000 });
        } else {
            toast({ title: "Error Saving Administrator", description: `Could not save admin details: ${error.message || 'Unknown error'}`, variant: "destructive" });
        }
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const confirmDeleteAdmin = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setIsDeleteAdminAlertOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete || !companyId) return;
    setIsSubmitting(true);
    try {
        const adminDocRef = doc(db, `companies/${companyId}/admins`, adminToDelete.id);
        await deleteDoc(adminDocRef);
        toast({ title: "Administrator Deleted", description: `Administrator "${adminToDelete.name}" has been removed.` });
        await fetchAndCacheAdmins(companyId);
    } catch (error: any) {
        console.error("Error deleting admin:", error);
        if (error.code === 'permission-denied') {
            toast({ title: "Permission Denied", description: "You do not have permission to delete administrators. Please check your Firestore Security Rules.", variant: "destructive", duration: 7000 });
        } else {
            toast({ title: "Error Deleting Administrator", description: `Could not remove administrator: ${error.message || 'Unknown error'}`, variant: "destructive" });
        }
    } finally {
        setIsDeleteAdminAlertOpen(false);
        setAdminToDelete(null);
        setIsSubmitting(false);
    }
  };

  const handleToggleAdminStatus = async (admin: AdminUser) => {
    if (!companyId) return;
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    setIsSubmitting(true);
    try {
        const adminDocRef = doc(db, `companies/${companyId}/admins`, admin.id);
        await updateDoc(adminDocRef, { status: newStatus, updatedAt: serverTimestamp() });
        toast({
          title: `Status Updated for ${admin.name}`,
          description: `${admin.name} is now ${newStatus}.`
        });
        await fetchAndCacheAdmins(companyId);
    } catch (error: any) {
        console.error("Error toggling admin status:", error);
        if (error.code === 'permission-denied') {
            toast({ title: "Permission Denied", description: "You do not have permission to change admin status. Please check your Firestore Security Rules.", variant: "destructive", duration: 7000 });
        } else {
            toast({ title: "Error Updating Status", description: `Could not update status: ${error.message || 'Unknown error'}`, variant: "destructive" });
        }
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleResendInvite = (adminEmail: string, adminName: string) => {
    // TODO: Implement actual email sending logic (e.g., via a Cloud Function)
    toast({
      title: "Invitation Resent (Simulated)",
      description: `An invitation email would be resent to ${adminName} at ${adminEmail}.`
    });
  };

  const getStatusVariant = (status: UserStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Active': return 'default'; 
      case 'Invited': return 'secondary';
      case 'Inactive': return 'outline';
      default: return 'secondary';
    }
  };

  if (authLoading || isLoadingAdmins) {
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
                <CardTitle className="flex items-center"><UserCog className="mr-2 h-6 w-6 text-primary"/>Administrators</CardTitle>
                <CardDescription>Manage administrator accounts and their permissions for your organization.</CardDescription>
            </div>
            <Button onClick={() => handleOpenInviteAdminDialog()} disabled={!companyId}>
                <PlusCircle className="mr-2 h-5 w-5" /> Invite New Administrator
            </Button>
        </div>
         <div className="mt-4 relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search administrators by name or email..." 
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
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length > 0 ? filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(admin.status)}>{admin.status}</Badge></TableCell>
                  <TableCell>{typeof admin.lastLoginAt === 'string' ? admin.lastLoginAt : (admin.lastLoginAt as Timestamp)?.toDate?.().toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">Admin Actions for {admin.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions for {admin.name}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenInviteAdminDialog(admin)} disabled={isSubmitting}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        {admin.status === 'Invited' && (
                            <DropdownMenuItem onClick={() => handleResendInvite(admin.email, admin.name)} disabled={isSubmitting}>
                                <Send className="mr-2 h-4 w-4" />
                                Resend Invitation
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleAdminStatus(admin)} disabled={isSubmitting}>
                          {admin.status === 'Active' ? <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" /> : <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />}
                          {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={(e) => { e.preventDefault(); confirmDeleteAdmin(admin); }}
                            disabled={isSubmitting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Administrator
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? `No administrators found for "${searchTerm}".` : "No administrators for this company yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {adminListCache && filteredAdmins.length > 0 && (
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredAdmins.length} of {adminListCache.length} administrators.</p>
        </CardFooter>
      )}

      <Suspense fallback={isInviteAdminDialogOpen ? <Skeleton className="w-full h-[300px] rounded-lg" /> : null}>
        {isInviteAdminDialogOpen && (
          <LazyDialog open={isInviteAdminDialogOpen} onOpenChange={setIsInviteAdminDialogOpen}>
            <LazyDialogContent className="sm:max-w-md">
              <LazyDialogHeader>
                <LazyDialogTitle>{editingAdmin ? 'Edit Administrator' : 'Invite New Administrator'}</LazyDialogTitle>
                <LazyDialogDescription>
                  {editingAdmin ? `Update details for ${editingAdmin.name}.` : 'Fill in the details below to invite a new administrator. They will receive an email with setup instructions.'}
                </LazyDialogDescription>
              </LazyDialogHeader>
              <form onSubmit={handleSaveAdmin}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Full Name</Label>
                    <Input
                      id="adminName"
                      value={newAdminForm.name || ''}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="e.g., Alex Johnson"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Address</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={newAdminForm.email || ''}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="e.g., alex.admin@example.com"
                      required
                      disabled={!!editingAdmin} 
                    />
                     {editingAdmin && <p className="text-xs text-muted-foreground">Email address cannot be changed after creation.</p>}
                  </div>
                </div>
                <LazyDialogFooter>
                  <LazyDialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                  </LazyDialogClose>
                  <Button type="submit" disabled={isSubmitting || !companyId}>
                    {isSubmitting ? 'Saving...' : (editingAdmin ? 'Save Changes' : 'Send Invitation')}
                  </Button>
                </LazyDialogFooter>
              </form>
            </LazyDialogContent>
          </LazyDialog>
        )}
      </Suspense>

      <Suspense fallback={isDeleteAdminAlertOpen ? <Skeleton className="w-full h-[200px] rounded-lg" /> : null}>
        {isDeleteAdminAlertOpen && (
          <LazyAlertDialog open={isDeleteAdminAlertOpen} onOpenChange={setIsDeleteAdminAlertOpen}>
            <LazyAlertDialogContent>
              <LazyAlertDialogHeader>
                <LazyAlertDialogTitle>Are you absolutely sure?</LazyAlertDialogTitle>
                <LazyAlertDialogDescription>
                    This action cannot be undone. This will permanently delete the administrator account for "{adminToDelete?.name}".
                    They will lose all administrative privileges.
                </LazyAlertDialogDescription>
              </LazyAlertDialogHeader>
              <LazyAlertDialogFooter>
                <LazyAlertDialogCancel onClick={() => setAdminToDelete(null)} disabled={isSubmitting}>Cancel</LazyAlertDialogCancel>
                <LazyAlertDialogAction onClick={handleDeleteAdmin} disabled={isSubmitting}>
                    {isSubmitting ? 'Deleting...' : 'Yes, delete administrator'}
                </LazyAlertDialogAction>
              </LazyAlertDialogFooter>
            </LazyAlertDialogContent>
          </LazyAlertDialog>
        )}
      </Suspense>
    </Card>
  );
}
