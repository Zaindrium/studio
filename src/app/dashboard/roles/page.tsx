
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { KeyRound, PlusCircle, Search, Edit, Trash2, MoreVertical, Settings2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, Timestamp, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Role, RolePermission } from '@/lib/app-types';
import { Skeleton } from '@/components/ui/skeleton';


const initialNewRoleState: Partial<Role> = {
    name: '',
    description: '',
    permissions: [], 
};

export default function RolesPage() {
  const { companyId, loading: authLoading, rolesListCache, fetchAndCacheRoles } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isModifyRoleDialogOpen, setIsModifyRoleDialogOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState<Partial<Role>>(initialNewRoleState);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteRoleAlertOpen, setIsDeleteRoleAlertOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);


  useEffect(() => {
    if (!authLoading && companyId) {
        if (!rolesListCache) {
            fetchAndCacheRoles(companyId).finally(() => setIsLoadingRoles(false));
        } else {
            setIsLoadingRoles(false);
        }
    } else if (!authLoading && !companyId) {
        setIsLoadingRoles(false);
    }
  }, [authLoading, companyId, rolesListCache, fetchAndCacheRoles]);

  const filteredRoles = useMemo(() => {
    if (!rolesListCache) return [];
    return rolesListCache.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rolesListCache, searchTerm]);

  const handleOpenModifyRoleDialog = (roleToEdit: Role | null = null) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setNewRoleForm({
        name: roleToEdit.name,
        description: roleToEdit.description,
        permissions: roleToEdit.permissions, 
      });
    } else {
      setEditingRole(null);
      setNewRoleForm(initialNewRoleState);
    }
    setIsModifyRoleDialogOpen(true);
  };
  
  const handleFormChange = (field: keyof Partial<Role>, value: string | RolePermission[]) => {
    setNewRoleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newRoleForm.name?.trim() || !newRoleForm.description?.trim()) {
        toast({ title: "Missing Information", description: "Role Name and Description are required.", variant: "destructive" });
        return;
    }
    if (!companyId) {
        toast({ title: "Error", description: "Company context not available.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    const roleDataToSave: Omit<Role, 'id' | 'createdAt' | 'updatedAt'> = {
        name: newRoleForm.name,
        description: newRoleForm.description,
        permissions: newRoleForm.permissions || [], // Default to empty array
        companyId: companyId,
    };

    try {
        if (editingRole) {
            const roleDocRef = doc(db, `companies/${companyId}/roles`, editingRole.id);
            await updateDoc(roleDocRef, { ...roleDataToSave, updatedAt: serverTimestamp() });
            toast({ title: "Role Updated", description: `Role "${newRoleForm.name}" has been updated.` });
        } else {
            const rolesCollectionRef = collection(db, `companies/${companyId}/roles`);
            await addDoc(rolesCollectionRef, { ...roleDataToSave, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
            toast({ title: "Role Created", description: `Role "${newRoleForm.name}" has been created.` });
        }
        setIsModifyRoleDialogOpen(false);
        await fetchAndCacheRoles(companyId);
    } catch (error: any) {
        console.error("Error saving role:", error);
        if (error.code === 'permission-denied') {
            toast({ title: "Permission Denied", description: "You do not have permission to save roles. Please check your Firestore Security Rules.", variant: "destructive", duration: 7000 });
        } else {
            toast({ title: "Error Saving Role", description: `Could not save role: ${error.message || 'Unknown error'}`, variant: "destructive" });
        }
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const confirmDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteRoleAlertOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete || !companyId) return;
    setIsSubmitting(true);
    try {
        const roleDocRef = doc(db, `companies/${companyId}/roles`, roleToDelete.id);
        await deleteDoc(roleDocRef);
        toast({ title: "Role Deleted", description: `Role "${roleToDelete.name}" has been removed.` });
        await fetchAndCacheRoles(companyId);
    } catch (error: any) {
        console.error("Error deleting role:", error);
        if (error.code === 'permission-denied') {
            toast({ title: "Permission Denied", description: "You do not have permission to delete roles. Please check your Firestore Security Rules.", variant: "destructive", duration: 7000 });
        } else {
            toast({ title: "Error Deleting Role", description: `Could not delete role: ${error.message || 'Unknown error'}`, variant: "destructive" });
        }
    } finally {
        setIsDeleteRoleAlertOpen(false);
        setRoleToDelete(null);
        setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingRoles) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-1/3 mb-4" />
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
                <CardTitle className="flex items-center"><KeyRound className="mr-2 h-6 w-6 text-primary"/>Roles &amp; Permissions</CardTitle>
                <CardDescription>Create and manage custom role definitions and their associated access levels.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModifyRoleDialog()} disabled={!companyId}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Role
            </Button>
        </div>
         <div className="mt-4 relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search roles by name or description..." 
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
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions (Simplified)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length > 0 ? filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions || []).slice(0, 3).map(perm => ( 
                        <Badge key={perm.id} variant="secondary" className="text-xs">{perm.name.replace(/_/g, ' ')}</Badge>
                      ))}
                      {(role.permissions || []).length > 3 && <Badge variant="outline" className="text-xs">+{ (role.permissions || []).length - 3} more</Badge>}
                       {(role.permissions || []).length === 0 && <Badge variant="outline" className="text-xs">No permissions</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isSubmitting}>
                          <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">Role Actions for {role.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions for {role.name}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenModifyRoleDialog(role)} disabled={isSubmitting}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role Details
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled> 
                            <Settings2 className="mr-2 h-4 w-4" />
                            Manage Permissions
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={(e) => { e.preventDefault(); confirmDeleteRole(role); }}
                            disabled={isSubmitting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {searchTerm ? `No roles found for "${searchTerm}".` : "No roles defined for this company yet. Click 'Add New Role' to start."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {rolesListCache && filteredRoles.length > 0 && (
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredRoles.length} of {rolesListCache.length} roles.</p>
        </CardFooter>
      )}

      <Dialog open={isModifyRoleDialogOpen} onOpenChange={setIsModifyRoleDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            <DialogDescription>
              {editingRole ? `Update details for the "${editingRole.name}" role.` : 'Define a new role and its purpose within the organization.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRole}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={newRoleForm.name || ''}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Content Editor"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  value={newRoleForm.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="e.g., Can create and edit content, but not publish."
                  required
                  rows={3}
                />
              </div>
              {/* Permissions management UI would go here - complex, for future */}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!companyId || isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingRole ? 'Save Changes' : 'Create Role')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteRoleAlertOpen} onOpenChange={setIsDeleteRoleAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the role "{roleToDelete?.name}".
                Users assigned this role might lose specific access.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Yes, delete role'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
