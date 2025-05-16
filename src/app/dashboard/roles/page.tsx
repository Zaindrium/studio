
"use client";

import React, { useState, useMemo } from 'react';
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
}

const MOCK_PERMISSIONS_DATA: RolePermission[] = [
    { id: 'perm1', name: 'manage_users', description: 'Can create, edit, and delete users.' },
    { id: 'perm2', name: 'manage_teams', description: 'Can create, edit, and delete teams.' },
    { id: 'perm3', name: 'view_analytics', description: 'Can view organization-wide analytics.' },
    { id: 'perm4', name: 'manage_billing', description: 'Can manage subscription and billing details.' },
    { id: 'perm5', name: 'create_cards', description: 'Can create business cards.' },
    { id: 'perm6', name: 'manage_templates', description: 'Can create and manage card templates.' },
];

const MOCK_ROLES_DATA: Role[] = [
  { 
    id: 'role_admin', 
    name: 'Administrator', 
    description: 'Full access to all organization features and settings.', 
    permissions: MOCK_PERMISSIONS_DATA 
  },
  { 
    id: 'role_manager', 
    name: 'Manager', 
    description: 'Can manage users and teams, view analytics, and create cards/templates.', 
    permissions: [MOCK_PERMISSIONS_DATA[0], MOCK_PERMISSIONS_DATA[1], MOCK_PERMISSIONS_DATA[2], MOCK_PERMISSIONS_DATA[5], MOCK_PERMISSIONS_DATA[4]] 
  },
  { 
    id: 'role_employee', 
    name: 'Employee', 
    description: 'Can create and manage their own business cards.', 
    permissions: [MOCK_PERMISSIONS_DATA[4]] 
  },
];

const initialNewRoleState: Partial<Role> = {
    name: '',
    description: '',
    permissions: [],
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isModifyRoleDialogOpen, setIsModifyRoleDialogOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState<Partial<Role>>(initialNewRoleState);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteRoleAlertOpen, setIsDeleteRoleAlertOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

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
    if (!newRoleForm.name?.trim() || !newRoleForm.description?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out Name and Description for the role.",
        variant: "destructive",
      });
      return;
    }

    if (editingRole) {
      setRoles(roles.map(role => 
        role.id === editingRole.id ? { ...editingRole, ...newRoleForm } as Role : role
      ));
      toast({
        title: "Role Updated!",
        description: `Role "${newRoleForm.name}" has been successfully updated.`,
      });
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: newRoleForm.name || 'Unnamed Role',
        description: newRoleForm.description || 'No description',
        permissions: newRoleForm.permissions || [],
      };
      setRoles(prevRoles => [newRole, ...prevRoles]);
      toast({
        title: "Role Created!",
        description: `Role "${newRole.name}" has been successfully created.`,
      });
    }
    setIsModifyRoleDialogOpen(false);
  };
  
  const confirmDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteRoleAlertOpen(true);
  };

  const handleDeleteRole = () => {
    if (!roleToDelete) return;
    setRoles(roles.filter(role => role.id !== roleToDelete.id));
    toast({
        title: "Role Deleted",
        description: `Role "${roleToDelete.name}" has been removed. (Simulation)`,
    });
    setIsDeleteRoleAlertOpen(false);
    setRoleToDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="flex items-center"><KeyRound className="mr-2 h-6 w-6 text-primary"/>Roles &amp; Permissions</CardTitle>
                <CardDescription>Create and manage custom role definitions and their associated access levels.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModifyRoleDialog()}>
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
                      {role.permissions.slice(0, 3).map(perm => ( 
                        <Badge key={perm.id} variant="secondary" className="text-xs">{perm.name.replace(/_/g, ' ')}</Badge>
                      ))}
                      {role.permissions.length > 3 && <Badge variant="outline" className="text-xs">+{role.permissions.length - 3} more</Badge>}
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
                    {searchTerm ? `No roles found for "${searchTerm}".` : "No custom roles defined yet."}
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
              {editingRole && (
                <div className="space-y-2 pt-2 border-t mt-2">
                    <Label>Assigned Permissions (Preview)</Label>
                    {editingRole.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {editingRole.permissions.map(p => <Badge key={p.id} variant="secondary">{p.name.replace(/_/g, ' ')}</Badge>)}
                        </div>
                    ) : <p className="text-xs text-muted-foreground">No specific permissions assigned yet.</p> }
                     <Button type="button" variant="outline" className="w-full mt-2" disabled>Manage Detailed Permissions (Coming Soon)</Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingRole ? 'Save Changes' : 'Create Role'}</Button>
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
            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole}>
                Yes, delete role
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
