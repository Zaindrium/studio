
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserCog, PlusCircle, Search, Edit, Trash2, MoreVertical, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { AuthenticatedUser, UserRole, UserStatus, Team } from '@/lib/app-types';
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


const MOCK_USERS_DATA: AuthenticatedUser[] = [
  { id: 'user1', name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', status: 'Active', teamId: 'team1', lastLoginAt: '2024-07-28 10:00 AM', cardsCreatedCount: 5, createdAt: '2023-01-15' },
  { id: 'user2', name: 'Jane Roe', email: 'jane.roe@example.com', role: 'Manager', status: 'Active', teamId: 'team1', lastLoginAt: '2024-07-29 09:00 AM', cardsCreatedCount: 3, createdAt: '2023-01-20' },
  { id: 'user3', name: 'Mike Chan', email: 'mike.chan@example.com', role: 'Admin', status: 'Active', teamId: 'team2', lastLoginAt: '2024-07-29 11:00 AM', cardsCreatedCount: 10, createdAt: '2023-02-01' },
  { id: 'user4', name: 'Sarah Lee', email: 'sarah.lee@example.com', role: 'Employee', status: 'Invited', teamId: 'team2', lastLoginAt: '-', cardsCreatedCount: 0, createdAt: '2024-07-25' },
  { id: 'user5', name: 'Tom Wilson', email: 'tom.wilson@example.com', role: 'Employee', status: 'Inactive', teamId: 'team1', lastLoginAt: '2024-06-01 03:00 PM', cardsCreatedCount: 1, createdAt: '2023-03-10' },
];

const MOCK_TEAMS_FOR_SELECT: Pick<Team, 'id' | 'name'>[] = [
  { id: 'team1', name: 'Sales Team Alpha' },
  { id: 'team2', name: 'Marketing Crew Gamma' },
  { id: 'team3', name: 'Engineering Squad Beta' },
];

const initialNewUserState: Partial<AuthenticatedUser> & { teamId: string } = {
    name: '',
    email: '',
    role: 'Employee',
    teamId: MOCK_TEAMS_FOR_SELECT[0]?.id || 'no-team',
};


export default function UsersPage() {
  const [users, setUsers] = useState<AuthenticatedUser[]>(MOCK_USERS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState<Partial<AuthenticatedUser> & { teamId: string }>(initialNewUserState);
  const [editingUser, setEditingUser] = useState<AuthenticatedUser | null>(null);
  const [isDeleteUserAlertOpen, setIsDeleteUserAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AuthenticatedUser | null>(null);


  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleOpenAddUserDialog = (userToEdit: AuthenticatedUser | null = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setNewUserForm({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        teamId: userToEdit.teamId || 'no-team', 
      });
    } else {
      setEditingUser(null);
      setNewUserForm(initialNewUserState);
    }
    setIsAddUserDialogOpen(true);
  };
  
  const handleFormChange = (field: keyof (Partial<AuthenticatedUser> & { teamId: string }), value: string | UserRole | UserStatus) => {
    setNewUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUserForm.name?.trim() || !newUserForm.email?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out Name and Email for the user.",
        variant: "destructive",
      });
      return;
    }

    const userTeamIdToSave = newUserForm.teamId === 'no-team' ? undefined : newUserForm.teamId;

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...newUserForm, teamId: userTeamIdToSave, updatedAt: new Date().toISOString().split('T')[0] } as AuthenticatedUser : u));
      toast({
        title: "User Updated!",
        description: `User "${newUserForm.name}" has been successfully updated.`,
      });
    } else {
      const newUser: AuthenticatedUser = {
        id: `user-${Date.now()}`,
        name: newUserForm.name || '',
        email: newUserForm.email || '',
        role: newUserForm.role || 'Employee',
        teamId: userTeamIdToSave, 
        status: 'Invited', 
        createdAt: new Date().toISOString().split('T')[0], 
        cardsCreatedCount: 0,
        lastLoginAt: '-',
      };

      setUsers(prevUsers => [newUser, ...prevUsers]);
      toast({
        title: "User Added!",
        description: `User "${newUser.name}" has been invited. An access code would be generated and sent.`,
      });
    }
    setIsAddUserDialogOpen(false);
  };
  
  const confirmDeleteUser = (user: AuthenticatedUser) => {
    setUserToDelete(user);
    setIsDeleteUserAlertOpen(true);
  };
  
  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers(users.filter(user => user.id !== userToDelete.id));
    toast({
        title: "User Deleted",
        description: `User "${userToDelete.name}" has been removed. (Simulation)`,
    });
    setIsDeleteUserAlertOpen(false);
    setUserToDelete(null);
  };

  const getTeamNameById = (teamId?: string) => {
    if (!teamId || teamId === 'no-team') return 'N/A';
    return MOCK_TEAMS_FOR_SELECT.find(t => t.id === teamId)?.name || 'Unknown Team';
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
                <CardTitle className="flex items-center"><UserCog className="mr-2 h-6 w-6 text-primary"/>User Management</CardTitle>
                <CardDescription>Manage users in your organization. Assign roles, manage access, and track onboarding.</CardDescription>
            </div>
            <Button onClick={() => handleOpenAddUserDialog()}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add New User
            </Button>
        </div>
         <div className="mt-4 relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
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
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'secondary' : 'outline' }>{user.role}</Badge></TableCell>
                  <TableCell>{getTeamNameById(user.teamId)}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(user.status)}>{user.status}</Badge></TableCell>
                  <TableCell>{user.lastLoginAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">User Actions for {user.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenAddUserDialog(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={user.status === 'Active'}>
                          <Send className="mr-2 h-4 w-4" />
                          Resend Invitation
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => confirmDeleteUser(user)}
                            onSelect={(e) => e.preventDefault()} // Prevents DropdownMenu from closing before Alert
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {searchTerm ? `No users found for "${searchTerm}".` : "No users yet. Click 'Add New User' to start."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {filteredUsers.length > 5 && (
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredUsers.length} of {users.length} users.</p>
        </CardFooter>
      )}

      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? `Update details for ${editingUser.name}.` : 'Fill in the details below to invite a new user to your organization.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUser}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={newUserForm.name || ''}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email Address</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUserForm.email || ''}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="e.g., alex.johnson@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userRole">Role</Label>
                <Select
                  value={newUserForm.role}
                  onValueChange={(value) => handleFormChange('role', value as UserRole)}
                >
                  <SelectTrigger id="userRole">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userTeam">Assign to Team</Label>
                <Select
                  value={newUserForm.teamId || 'no-team'}
                  onValueChange={(value) => handleFormChange('teamId', value)} 
                >
                  <SelectTrigger id="userTeam">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TEAMS_FOR_SELECT.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                     <SelectItem value="no-team">No Team (Assign Later)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingUser ? 'Save Changes' : 'Add User & Send Invite'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteUserAlertOpen} onOpenChange={setIsDeleteUserAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account for "{userToDelete?.name}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
                Yes, delete user
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
