
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
import { UserCog, PlusCircle, Search, Edit, Trash2, MoreVertical, Send, Link as LinkIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { StaffRecord, StaffRole, UserStatus, Team } from '@/lib/app-types'; // Updated to StaffRecord
import Link from 'next/link'; // Import Link
import { sanitizeForUrl } from '@/lib/utils';
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


// MOCK_USERS_DATA now represents StaffRecord[]
const MOCK_STAFF_DATA: StaffRecord[] = [
  { id: 'user1', name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', status: 'Active', teamId: 'team1', lastLoginAt: '2024-07-28 10:00 AM', cardsCreatedCount: 5, createdAt: '2023-01-15', fingerprintUrl: 'john-doe-staff-card' },
  { id: 'user2', name: 'Jane Roe', email: 'jane.roe@example.com', role: 'Manager', status: 'Active', teamId: 'team1', lastLoginAt: '2024-07-29 09:00 AM', cardsCreatedCount: 3, createdAt: '2023-01-20', fingerprintUrl: 'jane-roe-manager-card' },
  { id: 'user3', name: 'Mike Chan', email: 'mike.chan@example.com', role: 'Employee', status: 'Active', teamId: 'team2', lastLoginAt: '2024-07-29 11:00 AM', cardsCreatedCount: 10, createdAt: '2023-02-01', fingerprintUrl: 'mike-chan-card' },
  { id: 'user4', name: 'Sarah Lee', email: 'sarah.lee@example.com', role: 'Employee', status: 'Invited', teamId: 'team2', lastLoginAt: '-', cardsCreatedCount: 0, createdAt: '2024-07-25', fingerprintUrl: 'sarah-lee-pending' },
  { id: 'user5', name: 'Tom Wilson', email: 'tom.wilson@example.com', role: 'Contractor', status: 'Inactive', teamId: 'team1', lastLoginAt: '2024-06-01 03:00 PM', cardsCreatedCount: 1, createdAt: '2023-03-10', fingerprintUrl: 'tom-wilson-inactive' },
];

const MOCK_TEAMS_FOR_SELECT: Pick<Team, 'id' | 'name'>[] = [
  { id: 'team1', name: 'Sales Team Alpha' },
  { id: 'team2', name: 'Marketing Crew Gamma' },
  { id: 'team3', name: 'Engineering Squad Beta' },
];

// Form state now aligns more with StaffRecord properties
const initialNewStaffState: Partial<StaffRecord> & { teamId: string } = {
    name: '',
    email: '',
    role: 'Employee', // Default StaffRole
    teamId: MOCK_TEAMS_FOR_SELECT[0]?.id || 'no-team',
    fingerprintUrl: '', // This would likely be auto-generated in a real backend
};


export default function UsersPage() {
  const [staffList, setStaffList] = useState<StaffRecord[]>(MOCK_STAFF_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState<Partial<StaffRecord> & { teamId: string }>(initialNewStaffState);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [isDeleteStaffAlertOpen, setIsDeleteStaffAlertOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffRecord | null>(null);


  const filteredStaffList = useMemo(() => {
    return staffList.filter(staff =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffList, searchTerm]);

  const handleOpenAddStaffDialog = (staffToEdit: StaffRecord | null = null) => {
    if (staffToEdit) {
      setEditingStaff(staffToEdit);
      setNewStaffForm({
        name: staffToEdit.name,
        email: staffToEdit.email,
        role: staffToEdit.role,
        teamId: staffToEdit.teamId || 'no-team', 
        fingerprintUrl: staffToEdit.fingerprintUrl, // Include for editing consistency
      });
    } else {
      setEditingStaff(null);
      const defaultFingerprint = `new-staff-${Date.now().toString().slice(-5)}`;
      setNewStaffForm({...initialNewStaffState, fingerprintUrl: sanitizeForUrl(defaultFingerprint) });
    }
    setIsAddStaffDialogOpen(true);
  };
  
  const handleFormChange = (field: keyof (Partial<StaffRecord> & { teamId: string }), value: string | StaffRole | UserStatus) => {
    setNewStaffForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveStaff = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newStaffForm.name?.trim() || !newStaffForm.email?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out Name and Email for the staff member.",
        variant: "destructive",
      });
      return;
    }

    const staffTeamIdToSave = newStaffForm.teamId === 'no-team' ? undefined : newStaffForm.teamId;
    const fingerprint = newStaffForm.fingerprintUrl || sanitizeForUrl(newStaffForm.name || 'new-staff');


    if (editingStaff) {
      setStaffList(staffList.map(s => s.id === editingStaff.id ? { 
          ...editingStaff, 
          ...newStaffForm, 
          teamId: staffTeamIdToSave, 
          fingerprintUrl: newStaffForm.fingerprintUrl || editingStaff.fingerprintUrl, // Keep existing if not changed
          updatedAt: new Date().toISOString().split('T')[0] 
        } as StaffRecord : s));
      toast({
        title: "Staff Member Updated!",
        description: `Staff member "${newStaffForm.name}" has been successfully updated.`,
      });
    } else {
      const newStaffMember: StaffRecord = {
        id: `staff-${Date.now()}`,
        name: newStaffForm.name || '',
        email: newStaffForm.email || '',
        role: newStaffForm.role || 'Employee',
        teamId: staffTeamIdToSave, 
        status: 'Invited', 
        fingerprintUrl: fingerprint,
        createdAt: new Date().toISOString().split('T')[0], 
        cardsCreatedCount: 0, // Default for new staff
        lastLoginAt: '-', // Staff might not log in
      };

      setStaffList(prevStaff => [newStaffMember, ...prevStaff]);
      toast({
        title: "Staff Member Added!",
        description: `Staff member "${newStaffMember.name}" has been added. Their card URL is /card/${newStaffMember.fingerprintUrl}`,
      });
    }
    setIsAddStaffDialogOpen(false);
  };
  
  const confirmDeleteStaff = (staff: StaffRecord) => {
    setStaffToDelete(staff);
    setIsDeleteStaffAlertOpen(true);
  };
  
  const handleDeleteStaff = () => {
    if (!staffToDelete) return;
    setStaffList(staffList.filter(staff => staff.id !== staffToDelete.id));
    toast({
        title: "Staff Member Deleted",
        description: `Staff member "${staffToDelete.name}" has been removed. (Simulation)`,
    });
    setIsDeleteStaffAlertOpen(false);
    setStaffToDelete(null);
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
                <CardTitle className="flex items-center"><UserCog className="mr-2 h-6 w-6 text-primary"/>Staff Management</CardTitle>
                <CardDescription>Manage staff members in your organization. Assign roles, teams, and manage their digital card access.</CardDescription>
            </div>
            <Button onClick={() => handleOpenAddStaffDialog()}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Staff
            </Button>
        </div>
         <div className="mt-4 relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search staff by name or email..." 
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
                <TableHead>Card URL</TableHead> {/* New Column */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaffList.length > 0 ? filteredStaffList.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell><Badge variant={staff.role === 'Manager' ? 'secondary' : 'outline' }>{staff.role}</Badge></TableCell>
                  <TableCell>{getTeamNameById(staff.teamId)}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(staff.status)}>{staff.status}</Badge></TableCell>
                  <TableCell>
                    {staff.fingerprintUrl ? (
                      <Link href={`/card/${staff.fingerprintUrl}`} target="_blank" className="text-primary hover:underline flex items-center text-xs">
                        <LinkIcon className="mr-1 h-3 w-3" /> View Card
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">Actions for {staff.name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenAddStaffDialog(staff)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={staff.status === 'Active'}>
                          <Send className="mr-2 h-4 w-4" />
                          Resend Invitation/Setup
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => confirmDeleteStaff(staff)}
                            onSelect={(e) => e.preventDefault()} 
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center"> {/* Updated colSpan */}
                    {searchTerm ? `No staff found for "${searchTerm}".` : "No staff members yet. Click 'Add New Staff' to start."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {filteredStaffList.length > 5 && (
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredStaffList.length} of {staffList.length} staff members.</p>
        </CardFooter>
      )}

      <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? `Update details for ${editingStaff.name}.` : 'Fill in the details below to add a new staff member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveStaff}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="staffName">Full Name</Label>
                <Input
                  id="staffName"
                  value={newStaffForm.name || ''}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffEmail">Email Address</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  value={newStaffForm.email || ''}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="e.g., alex.johnson@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffRole">Role in Company</Label>
                <Select
                  value={newStaffForm.role}
                  onValueChange={(value) => handleFormChange('role', value as StaffRole)}
                >
                  <SelectTrigger id="staffRole">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                    {/* Add other relevant staff roles */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffTeam">Assign to Team</Label>
                <Select
                  value={newStaffForm.teamId || 'no-team'}
                  onValueChange={(value) => handleFormChange('teamId', value)} 
                >
                  <SelectTrigger id="staffTeam">
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
              <div className="space-y-2">
                <Label htmlFor="staffFingerprintUrl">Card URL Segment</Label>
                <Input
                  id="staffFingerprintUrl"
                  value={newStaffForm.fingerprintUrl || ''}
                  onChange={(e) => handleFormChange('fingerprintUrl', sanitizeForUrl(e.target.value))}
                  placeholder="e.g., alex-johnson-card (auto-generated if blank)"
                />
                <p className="text-xs text-muted-foreground">Unique part of the card URL. Will be sanitized. e.g., /card/{newStaffForm.fingerprintUrl || 'preview'}</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingStaff ? 'Save Changes' : 'Add Staff Member'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteStaffAlertOpen} onOpenChange={setIsDeleteStaffAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the staff record for "{staffToDelete?.name}". Their digital card will no longer be accessible.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStaffToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff}>
                Yes, delete staff member
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
