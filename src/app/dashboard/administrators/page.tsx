
"use client";

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, PlusCircle, Search, Edit, Trash2, MoreVertical, Send, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { AuthenticatedUser, UserStatus } from '@/lib/app-types'; 
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableHead } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import Dialog and AlertDialog
const LazyDialog = lazy(() => import("@/components/ui/dialog").then(m => ({ default: m.Dialog })));
const LazyAlertDialog = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialog })));


const MOCK_ADMINS_DATA: AuthenticatedUser[] = [
  { id: 'admin1', name: 'Alice Admin', email: 'alice.admin@example.com', role: 'Admin', status: 'Active', teamId: undefined, lastLoginAt: '2024-07-30 10:00 AM', cardsCreatedCount: 0, createdAt: '2023-01-10' },
  { id: 'admin2', name: 'Robert ManagerAdmin', email: 'bob.admin@example.com', role: 'Admin', status: 'Active', teamId: undefined, lastLoginAt: '2024-07-29 09:30 AM', cardsCreatedCount: 0, createdAt: '2023-02-15' },
  { id: 'admin3', name: 'Charlie Invited', email: 'charlie.newadmin@example.com', role: 'Admin', status: 'Invited', teamId: undefined, lastLoginAt: '-', cardsCreatedCount: 0, createdAt: '2024-07-28' },
];

const initialNewAdminState: Partial<AuthenticatedUser> = {
    name: '',
    email: '',
    role: 'Admin', 
    status: 'Invited',
};

export default function AdministratorsPage() {
  const [administrators, setAdministrators] = useState<AuthenticatedUser[]>(MOCK_ADMINS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isInviteAdminDialogOpen, setIsInviteAdminDialogOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState<Partial<AuthenticatedUser>>(initialNewAdminState);
  const [editingAdmin, setEditingAdmin] = useState<AuthenticatedUser | null>(null);
  const [isDeleteAdminAlertOpen, setIsDeleteAdminAlertOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AuthenticatedUser | null>(null);


  const filteredAdmins = useMemo(() => {
    return administrators.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [administrators, searchTerm]);

  const handleOpenInviteAdminDialog = (adminToEdit: AuthenticatedUser | null = null) => {
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
  
  const handleFormChange = (field: keyof Partial<AuthenticatedUser>, value: string | UserStatus) => {
    setNewAdminForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAdmin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newAdminForm.name?.trim() || !newAdminForm.email?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out Name and Email for the administrator.",
        variant: "destructive",
      });
      return;
    }

    if (editingAdmin) {
      setAdministrators(administrators.map(admin => 
        admin.id === editingAdmin.id ? { ...editingAdmin, ...newAdminForm, role: 'Admin' } as AuthenticatedUser : admin
      ));
      toast({
        title: "Administrator Updated!",
        description: `Administrator "${newAdminForm.name}" has been successfully updated.`,
      });
    } else {
      const newAdmin: AuthenticatedUser = {
        id: `admin-${Date.now()}`,
        name: newAdminForm.name || '',
        email: newAdminForm.email || '',
        role: 'Admin',
        status: 'Invited', 
        createdAt: new Date().toISOString().split('T')[0], 
        cardsCreatedCount: 0,
        lastLoginAt: '-',
      };
      setAdministrators(prevAdmins => [newAdmin, ...prevAdmins]);
      toast({
        title: "Administrator Invited!",
        description: `An invitation email would be sent to "${newAdmin.name}".`,
      });
    }
    setIsInviteAdminDialogOpen(false);
  };
  
  const confirmDeleteAdmin = (admin: AuthenticatedUser) => {
    setAdminToDelete(admin);
    setIsDeleteAdminAlertOpen(true);
  };

  const handleDeleteAdmin = () => {
    if (!adminToDelete) return;
    setAdministrators(administrators.filter(admin => admin.id !== adminToDelete.id));
    toast({
        title: "Administrator Deleted",
        description: `Administrator "${adminToDelete.name}" has been removed. (Simulation)`,
    });
    setIsDeleteAdminAlertOpen(false);
    setAdminToDelete(null);
  };

  const handleToggleAdminStatus = (adminId: string) => {
    setAdministrators(prevAdmins => 
      prevAdmins.map(admin => {
        if (admin.id === adminId) {
          const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
          toast({
            title: `Status Changed for ${admin.name}`,
            description: `${admin.name} is now ${newStatus}.`
          });
          return { ...admin, status: newStatus };
        }
        return admin;
      })
    );
  };
  
  const handleResendInvite = (adminEmail: string, adminName: string) => {
    toast({
      title: "Invitation Resent",
      description: `An invitation email would be resent to ${adminName} at ${adminEmail}. (Simulation)`
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="flex items-center"><UserCog className="mr-2 h-6 w-6 text-primary"/>Administrators</CardTitle>
                <CardDescription>Manage administrator accounts and their permissions for your organization.</CardDescription>
            </div>
            <Button onClick={() => handleOpenInviteAdminDialog()}>
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
                  <TableCell>{admin.lastLoginAt}</TableCell>
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
                    {searchTerm ? `No administrators found for "${searchTerm}".` : "No administrators invited yet."}
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

      <Suspense fallback={isInviteAdminDialogOpen ? <Skeleton className=\"w-full h-[300px] rounded-lg\" /> : null}>
        <LazyDialog open={isInviteAdminDialogOpen} onOpenChange={setIsInviteAdminDialogOpen}>
          {/* Import and use DialogContent and other sub-components directly if they are small
              or lazy load them as well if they are large. For simplicity, assuming they are small.
              If DialogContent itself is large, it might need its own lazy load.
           */}
          <Suspense fallback={<Skeleton className=\"w-full h-[250px] rounded-lg\" />}>
            <import(\"@/components/ui/dialog\").then(m => m.DialogContent) className="sm:max-w-md">
              <import(\"@/components/ui/dialog\").then(m => m.DialogHeader)>
                <import(\"@/components/ui/dialog\").then(m => m.DialogTitle)>{editingAdmin ? 'Edit Administrator' : 'Invite New Administrator'}</import(\"@/components/ui/dialog\").then(m => m.DialogTitle)>
                <import(\"@/components/ui/dialog\").then(m => m.DialogDescription)>
                  {editingAdmin ? `Update details for ${editingAdmin.name}.` : 'Fill in the details below to invite a new administrator. They will receive an email with setup instructions.'}
                </import(\"@/components/ui/dialog\").then(m => m.DialogDescription)>
              </import(\"@/components/ui/dialog\").then(m => m.DialogHeader)>
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
                <import(\"@/components/ui/dialog\").then(m => m.DialogFooter)>
                  <import(\"@/components/ui/dialog\").then(m => m.DialogClose) asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </import(\"@/components/ui/dialog\").then(m => m.DialogClose)>
                  <Button type="submit">{editingAdmin ? 'Save Changes' : 'Send Invitation'}</Button>
                </import(\"@/components/ui/dialog\").then(m => m.DialogFooter)>
              </form>
            </import(\"@/components/ui/dialog\").then(m => m.DialogContent)>
          </Suspense>
        </LazyDialog>
      </Suspense>

      <Suspense fallback={isDeleteAdminAlertOpen ? <Skeleton className=\"w-full h-[200px] rounded-lg\" /> : null}>
        <LazyAlertDialog open={isDeleteAdminAlertOpen} onOpenChange={setIsDeleteAdminAlertOpen}>
          {/* Import and use AlertDialogContent and other sub-components directly or lazy load them */}
          <Suspense fallback={<Skeleton className=\"w-full h-[150px] rounded-lg\" />}>
            <import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogContent)>
              <import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogHeader)>
                <import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogTitle)>Are you absolutely sure?</import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogTitle)>
                <import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogDescription)>
                    This action cannot be undone. This will permanently delete the administrator account for "{adminToDelete?.name}".
                    They will lose all administrative privileges.
                </import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogDescription)>
              </import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogHeader)>
              <import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogFooter)>
                <import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogCancel) onClick={() => setAdminToDelete(null)}>Cancel</import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogCancel)>
                <import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogAction) onClick={handleDeleteAdmin}>
                    Yes, delete administrator
                </import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogAction)>
              </import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogFooter)>
            </import(\"@/components/ui/alert-dialog\").then(m => m.AlertDialogContent)>
          </Suspense>
        </LazyAlertDialog>
      </Suspense>
    </Card>
  );
}
