
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
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
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { db } from '@/lib/firebase'; // Import db
import { collection, query, getDocs, Timestamp } from 'firebase/firestore'; // Import Firestore functions
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


interface RolePermission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[]; 
  // companyId might be implicit if roles are company-specific
}

// MOCK_PERMISSIONS_DATA and MOCK_ROLES_DATA removed

const initialNewRoleState: Partial<Role> = {
    name: '',
    description: '',
    permissions: [], // Permissions management would be more complex
};

export default function RolesPage() {
  const { companyId, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isModifyRoleDialogOpen, setIsModifyRoleDialogOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState<Partial<Role>>(initialNewRoleState);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteRoleAlertOpen, setIsDeleteRoleAlertOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!companyId) {
        if (!authLoading) { /* toast({ title: "Error", description: "Company ID missing. Cannot fetch roles.", variant: "destructive" }); */ }
        setRoles([]);
        setIsLoadingRoles(false);
        return;
    }
    setIsLoadingRoles(true);
    try {
        // Assuming roles are stored under a 'roles' subcollection in each company
        // Or a top-level 'roles' collection with a companyId field.
        // For this example, let's assume they are NOT company-specific yet or we'd need to query by companyId.
        // If roles are company-specific, path would be e.g., `companies/${companyId}/roles`
        // For now, will use a general placeholder message if no roles.
        
        // Placeholder: In a real app, you'd fetch from Firestore:
        // const rolesCollectionRef = collection(db, `companies/${companyId}/roles`); // Or a global roles collection
        // const q = query(rolesCollectionRef);
        // const querySnapshot = await getDocs(q);
        // const fetchedRoles: Role[] = [];
        // querySnapshot.forEach((docSnap) => { ... });
        // setRoles(fetchedRoles);
        setRoles([]); // Start with no roles if not fetching
    } catch (error) {
        console.error("Error fetching roles:", error);
        toast({ title: "Error", description: "Could not fetch roles list.", variant: "destructive" });
    } finally {
        setIsLoadingRoles(false);
    }
  }, [companyId, toast, authLoading]);

  useEffect(() => {
    if (!authLoading && companyId) { // Also check for companyId
        fetchRoles();
    } else if (!authLoading && !companyId) {
        setRoles([]);
        setIsLoadingRoles(false);
    }
  }, [fetchRoles, authLoading, companyId]);


  const filteredRoles = useMemo(() => {
    return roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

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

  const handleSaveRole = (event: React.FormEvent) => {
    event.preventDefault();
     // TODO: Implement Firestore save/update logic for roles
    toast({ title: "Action Incomplete", description: "Saving/updating roles to Firestore not yet implemented.", variant: "default" });
    setIsModifyRoleDialogOpen(false);
  };
  
  const confirmDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteRoleAlertOpen(true);
  };

  const handleDeleteRole = () => {
    if (!roleToDelete) return;
    // TODO: Implement Firestore delete logic for roles
    toast({ title: "Action Incomplete", description: `Deleting role "${roleToDelete.name}" from Firestore not yet implemented.`, variant: "default" });
    setIsDeleteRoleAlertOpen(false);
    setRoleToDelete(null);
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
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">Role Actions for {role.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions for {role.name}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenModifyRoleDialog(role)}>
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
                            onSelect={(e) => {
                                e.preventDefault();
                                confirmDeleteRole(role);
                            }}
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
      {filteredRoles.length > 0 && (
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredRoles.length} of {roles.length} roles.</p>
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
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!companyId}>{editingRole ? 'Save Changes (Simulated)' : 'Create Role (Simulated)'}</Button>
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
                Users assigned this role might lose specific access. (Action is simulated)
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole}>
                Yes, delete role (Simulated)
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
