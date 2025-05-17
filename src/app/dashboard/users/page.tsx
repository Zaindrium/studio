
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import type { StaffRecord, StaffRole, UserStatus, Team } from '@/lib/app-types';
import { defaultStaffCardData, defaultCardDesignSettings } from '@/lib/app-types';
import Link from 'next/link';
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
import { db } from '@/lib/firebase'; 
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  Timestamp,
  deleteField 
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

const generateUniqueFingerprint = () => {
  return sanitizeForUrl(`staff-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`);
};

const initialNewStaffState: Partial<Omit<StaffRecord, 'fingerprintUrl' | 'cardDisplayData' | 'designSettings'>> & { teamId?: string } = {
    name: '',
    email: '',
    role: 'Employee',
    teamId: 'no-team',
    status: 'Invited',
};


export default function UsersPage() {
  const { currentUser, loading: authLoading, companyId } = useAuth(); 
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState<Partial<Omit<StaffRecord, 'fingerprintUrl' | 'cardDisplayData' | 'designSettings'>> & { teamId?: string }>(initialNewStaffState);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [isDeleteStaffAlertOpen, setIsDeleteStaffAlertOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffRecord | null>(null);
  
  const [teamsList, setTeamsList] = useState<Pick<Team, 'id' | 'name'>[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!companyId) {
      if (!authLoading) { 
        // toast({ title: "Error", description: "Company ID not found. Cannot fetch staff.", variant: "destructive" });
      }
      setIsLoadingData(false);
      setStaffList([]); 
      return;
    }
    setIsLoadingData(true);
    try {
      const staffCollectionRef = collection(db, `companies/${companyId}/staff`);
      const q = query(staffCollectionRef); 
      const querySnapshot = await getDocs(q);
      const fetchedStaff: StaffRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedStaff.push({ 
          id: docSnap.id, 
          ...data,
          createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())).toISOString(),
          updatedAt: (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())).toISOString(),
          lastLoginAt: data.lastLoginAt instanceof Timestamp ? data.lastLoginAt.toDate().toLocaleString() : data.lastLoginAt || '-',
        } as StaffRecord);
      });
      setStaffList(fetchedStaff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast({ title: "Error", description: "Could not fetch staff list.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [companyId, toast, authLoading]);

  const fetchTeamsForSelect = useCallback(async () => {
    if (!companyId) return;
    setIsLoadingTeams(true);
    try {
      const teamsCollectionRef = collection(db, `companies/${companyId}/teams`);
      const q = query(teamsCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedTeams: Pick<Team, 'id' | 'name'>[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedTeams.push({ id: docSnap.id, name: docSnap.data().name });
      });
      setTeamsList(fetchedTeams);
    } catch (error) {
      console.error("Error fetching teams for select:", error);
      toast({ title: "Error", description: "Could not fetch teams list for assignment.", variant: "destructive" });
    } finally {
      setIsLoadingTeams(false);
    }
  }, [companyId, toast]);

  useEffect(() => {
    if (!authLoading && companyId) { 
      fetchStaff();
      fetchTeamsForSelect();
    } else if (!authLoading && !companyId) {
      setStaffList([]);
      setTeamsList([]);
      setIsLoadingData(false);
    }
  }, [fetchStaff, fetchTeamsForSelect, authLoading, companyId]);

  const filteredStaffList = useMemo(() => {
    return staffList.filter(staff =>
      (staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffList, searchTerm]);

  const handleOpenAddStaffDialog = (staffToEdit: StaffRecord | null = null) => {
    if (staffToEdit) {
      setEditingStaff(staffToEdit);
      setNewStaffForm({
        name: staffToEdit.name,
        email: staffToEdit.email,
        role: staffToEdit.role,
        status: staffToEdit.status,
        teamId: staffToEdit.teamId || 'no-team',
      });
    } else {
      setEditingStaff(null);
      setNewStaffForm(initialNewStaffState);
    }
    setIsAddStaffDialogOpen(true);
  };
  
  const handleFormChange = (field: keyof (Partial<Omit<StaffRecord, 'fingerprintUrl' | 'cardDisplayData' | 'designSettings'>> & { teamId?: string }), value: string | StaffRole | UserStatus) => {
    setNewStaffForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newStaffForm.name?.trim() || !newStaffForm.email?.trim()) {
      toast({ title: "Missing Information", description: "Name and Email are required.", variant: "destructive" });
      return;
    }
    if (!companyId) {
      toast({ title: "Error", description: "Company ID not found for admin.", variant: "destructive" });
      return;
    }
    
    const staffDataToSaveBase: Omit<StaffRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'cardsCreatedCount' | 'fingerprintUrl' | 'cardDisplayData' | 'designSettings'> = {
      name: newStaffForm.name,
      email: newStaffForm.email,
      role: newStaffForm.role || 'Employee',
      status: editingStaff ? newStaffForm.status || editingStaff.status : 'Invited',
    };
    
    let dataForFirestore: any = {...staffDataToSaveBase};

    if (newStaffForm.teamId && newStaffForm.teamId !== 'no-team') {
      dataForFirestore.teamId = newStaffForm.teamId;
    } else if (editingStaff && newStaffForm.teamId === 'no-team') {
      dataForFirestore.teamId = deleteField(); // Remove field if "No Team" is selected on edit
    }
    // if teamId is undefined (initial add with 'no-team'), it's simply omitted from dataForFirestore

    try {
      if (editingStaff) {
        const staffDocRef = doc(db, `companies/${companyId}/staff`, editingStaff.id);
        await updateDoc(staffDocRef, { ...dataForFirestore, updatedAt: serverTimestamp() });
        toast({ title: "Staff Updated", description: `${newStaffForm.name} has been updated.` });
      } else {
        const staffCollectionRef = collection(db, `companies/${companyId}/staff`);
        const finalFingerprintUrl = generateUniqueFingerprint();
        dataForFirestore = {
          ...dataForFirestore,
          fingerprintUrl: finalFingerprintUrl, 
          cardDisplayData: { // Add default card display data
            ...defaultStaffCardData, 
            name: newStaffForm.name, 
            email: newStaffForm.email, 
            title: newStaffForm.role || 'Employee', // Or a default title
          },
          designSettings: defaultCardDesignSettings, // Add default design settings
          cardsCreatedCount: 0,
          lastLoginAt: '-', 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp() 
        };
        await addDoc(staffCollectionRef, dataForFirestore);
        toast({ title: "Staff Added", description: `${newStaffForm.name} has been added.` });
      }
      setIsAddStaffDialogOpen(false);
      fetchStaff(); 
    } catch (error) {
      console.error("Error saving staff:", error);
      toast({ title: "Error Saving Staff", description: "Could not save staff details.", variant: "destructive" });
    }
  };
  
  const confirmDeleteStaff = (staff: StaffRecord) => {
    setStaffToDelete(staff);
    setIsDeleteStaffAlertOpen(true);
  };
  
  const handleDeleteStaff = async () => {
    if (!staffToDelete || !companyId) return;
    try {
      const staffDocRef = doc(db, `companies/${companyId}/staff`, staffToDelete.id);
      await deleteDoc(staffDocRef);
      toast({ title: "Staff Deleted", description: `${staffToDelete.name} has been removed.` });
      fetchStaff(); 
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast({ title: "Error Deleting Staff", description: "Could not remove staff.", variant: "destructive" });
    } finally {
      setIsDeleteStaffAlertOpen(false);
      setStaffToDelete(null);
    }
  };

  const getTeamNameById = (teamId?: string) => {
    if (!teamId || teamId === 'no-team') return 'N/A';
    return teamsList.find(t => t.id === teamId)?.name || 'Unknown Team';
  };
  
  const getStatusVariant = (status?: UserStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'Active': return 'default'; 
      case 'Invited': return 'secondary';
      case 'Inactive': return 'outline';
      default: return 'secondary';
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-1/3 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
                <CardTitle className="flex items-center"><UserCog className="mr-2 h-6 w-6 text-primary"/>Staff Management</CardTitle>
                <CardDescription>Manage staff members in your organization. Assign roles, teams, and manage their digital card access.</CardDescription>
            </div>
            <Button onClick={() => handleOpenAddStaffDialog()} disabled={!companyId || isLoadingTeams}>
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
                <TableHead>Card URL</TableHead>
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
                            onClick={(e) => { e.preventDefault(); confirmDeleteStaff(staff); }}
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
                  <TableCell colSpan={7} className="h-24 text-center">
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
              {editingStaff ? `Update details for ${editingStaff.name}. Card URL segment cannot be changed.` : 'Fill in the details below to add a new staff member. The card URL will be auto-generated.'}
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
                  </SelectContent>
                </Select>
              </div>
               {editingStaff && (
                <div className="space-y-2">
                    <Label htmlFor="staffStatus">Status</Label>
                    <Select
                    value={newStaffForm.status}
                    onValueChange={(value) => handleFormChange('status', value as UserStatus)}
                    >
                    <SelectTrigger id="staffStatus">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Invited">Invited</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                )}
              <div className="space-y-2">
                <Label htmlFor="staffTeam">Assign to Team</Label>
                {isLoadingTeams ? <Skeleton className="h-10 w-full" /> : (
                <Select
                  value={newStaffForm.teamId || 'no-team'}
                  onValueChange={(value) => handleFormChange('teamId', value)} 
                >
                  <SelectTrigger id="staffTeam">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="no-team">No Team (Assign Later)</SelectItem>
                    {teamsList.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                )}
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
