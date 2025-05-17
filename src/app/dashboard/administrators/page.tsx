
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
import { collection, query, getDocs, Timestamp } from 'firebase/firestore'; // Removed addDoc, updateDoc, deleteDoc for now


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


// MOCK_ADMINS_DATA removed

const initialNewAdminState: Partial<AdminUser> = {
    name: '',
    email: '',
    role: 'Admin', 
    status: 'Invited',
};

export default function AdministratorsPage() {
  const { companyId, loading: authLoading } = useAuth();
  const [administrators, setAdministrators] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isInviteAdminDialogOpen, setIsInviteAdminDialogOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState<Partial<AdminUser>>(initialNewAdminState);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isDeleteAdminAlertOpen, setIsDeleteAdminAlertOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  const fetchAdmins = useCallback(async () => {
    if (!companyId) {
        if (!authLoading) { /* toast({ title: "Error", description: "Company ID missing. Cannot fetch admins.", variant: "destructive" }); */ }
        setAdministrators([]);
        setIsLoadingAdmins(false);
        return;
    }
    setIsLoadingAdmins(true);
    try {
        const adminsCollectionRef = collection(db, `companies/${companyId}/admins`);
        const q = query(adminsCollectionRef);
        const querySnapshot = await getDocs(q);
        const fetchedAdmins: AdminUser[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedAdmins.push({
                id: docSnap.id,
                ...data,
                createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())).toISOString(),
                updatedAt: (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())).toISOString(),
                lastLoginAt: data.lastLoginAt instanceof Timestamp ? data.lastLoginAt.toDate().toLocaleString() : data.lastLoginAt || '-',
            } as AdminUser);
        });
        setAdministrators(fetchedAdmins);
    } catch (error) {
        console.error("Error fetching administrators:", error);
        toast({ title: "Error", description: "Could not fetch administrators list.", variant: "destructive" });
    } finally {
        setIsLoadingAdmins(false);
    }
  }, [companyId, toast, authLoading]);

  useEffect(() => {
    if (!authLoading && companyId) {
        fetchAdmins();
    } else if (!authLoading && !companyId) {
        setAdministrators([]);
        setIsLoadingAdmins(false);
    }
  }, [fetchAdmins, authLoading, companyId]);


  const filteredAdmins = useMemo(() => {
    return administrators.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [administrators, searchTerm]);

  const handleOpenInviteAdminDialog = (adminToEdit: AdminUser | null = null) => {
    if (adminToEdit) {
      setEditingAdmin(adminToEdit);
      setNewAdminForm({
        name: adminToEdit.name,
        email: adminToEdit.email,
        role: 'Admin', 
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

  const handleSaveAdmin = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement Firestore save/update logic for admins
    toast({ title: "Action Incomplete", description: "Saving/updating admins to Firestore not yet implemented.", variant: "default" });
    setIsInviteAdminDialogOpen(false);
  };
  
  const confirmDeleteAdmin = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setIsDeleteAdminAlertOpen(true);
  };

  const handleDeleteAdmin = () => {
    if (!adminToDelete) return;
    // TODO: Implement Firestore delete logic for admins
    toast({ title: "Action Incomplete", description: `Deleting admin "${adminToDelete.name}" from Firestore not yet implemented.`, variant: "default" });
    setIsDeleteAdminAlertOpen(false);
    setAdminToDelete(null);
  };

  const handleToggleAdminStatus = (adminId: string) => {
    // TODO: Implement Firestore status update logic
    setAdministrators(prevAdmins => 
      prevAdmins.map(admin => {
        if (admin.id === adminId) {
          const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
          toast({
            title: `Status Change (Simulated) for ${admin.name}`,
            description: `${admin.name} is now ${newStatus}. Backend update needed.`
          });
          return { ...admin, status: newStatus };
        }
        return admin;
      })
    );
  };
  
  const handleResendInvite = (adminEmail: string, adminName: string) => {
    // TODO: Implement actual email sending logic
    toast({
      title: "Invitation Resent (Simulated)",
      description: `An invitation email would be resent to ${adminName} at ${adminEmail}. Backend update needed.`
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
                        <DropdownMenuItem onClick={() => handleOpenInviteAdminDialog(admin)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        {admin.status === 'Invited' && (
                            <DropdownMenuItem onClick={() => handleResendInvite(admin.email, admin.name)}>
                                <Send className="mr-2 h-4 w-4" />
                                Resend Invitation
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleAdminStatus(admin.id)}>
                          {admin.status === 'Active' ? <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" /> : <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />}
                          {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={(e) => {
                                e.preventDefault();
                                confirmDeleteAdmin(admin);
                            }}
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
      {filteredAdmins.length > 0 && (
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredAdmins.length} of {administrators.length} administrators.</p>
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
                      disabled={!!editingAdmin} // Email usually not editable after creation
                    />
                     {editingAdmin && <p className="text-xs text-muted-foreground">Email address cannot be changed after creation.</p>}
                  </div>
                </div>
                <LazyDialogFooter>
                  <LazyDialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </LazyDialogClose>
                  <Button type="submit">{editingAdmin ? 'Save Changes (Simulated)' : 'Send Invitation (Simulated)'}</Button>
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
                    They will lose all administrative privileges. (Action is simulated)
                </LazyAlertDialogDescription>
              </LazyAlertDialogHeader>
              <LazyAlertDialogFooter>
                <LazyAlertDialogCancel onClick={() => setAdminToDelete(null)}>Cancel</LazyAlertDialogCancel>
                <LazyAlertDialogAction onClick={handleDeleteAdmin}>
                    Yes, delete administrator (Simulated)
                </LazyAlertDialogAction>
              </LazyAlertDialogFooter>
            </LazyAlertDialogContent>
          </LazyAlertDialog>
        )}
      </Suspense>
    </Card>
  );
}
