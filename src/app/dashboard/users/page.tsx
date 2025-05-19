
"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
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

const AddEditStaffDialog = React.lazy(() => import('@/components/dashboard/users/add-edit-staff-dialog'));


const generateUniqueFingerprint = () => {
  return sanitizeForUrl(`staff-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`);
};

export default function UsersPage() {
  const { companyId, loading: authLoading, staffListCache, fetchAndCacheStaff, teamsListCache, fetchAndCacheTeams } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true); // Combined loading state

  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [isDeleteStaffAlertOpen, setIsDeleteStaffAlertOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (!authLoading && companyId) {
      const staffPromise = staffListCache ? Promise.resolve() : fetchAndCacheStaff(companyId);
      const teamsPromise = teamsListCache ? Promise.resolve() : fetchAndCacheTeams(companyId);

      Promise.all([staffPromise, teamsPromise]).finally(() => {
        setIsLoadingData(false);
      });

    } else if (!authLoading && !companyId) {
      setIsLoadingData(false);
    }
  }, [authLoading, companyId, staffListCache, fetchAndCacheStaff, teamsListCache, fetchAndCacheTeams]);


  const filteredStaffList = useMemo(() => {
    if (!staffListCache) return [];
    return staffListCache.filter(staff =>
      (staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffListCache, searchTerm]);

  const handleOpenAddStaffDialog = (staffToEdit: StaffRecord | null = null) => {
    setEditingStaff(staffToEdit);
    setIsAddStaffDialogOpen(true);
  };

  const handleSaveStaffSuccess = async () => {
    setIsAddStaffDialogOpen(false);
    setEditingStaff(null);
    if (companyId) {
        setIsLoadingData(true); // Indicate refresh
        await fetchAndCacheStaff(companyId);
        setIsLoadingData(false);
    }
  };
  
  const confirmDeleteStaff = (staff: StaffRecord) => {
    setStaffToDelete(staff);
    setIsDeleteStaffAlertOpen(true);
  };
  
  const handleDeleteStaff = async () => {
    if (!staffToDelete || !companyId) return;
    setIsSubmitting(true);
    try {
      const staffDocRef = doc(db, `companies/${companyId}/staff`, staffToDelete.id);
      await deleteDoc(staffDocRef);
      toast({ title: "Staff Deleted", description: `${staffToDelete.name} has been removed.` });
      if (companyId) { // Refresh cache
        await fetchAndCacheStaff(companyId);
      }
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      if (error.code === 'permission-denied') {
        toast({ title: "Permission Denied", description: "You do not have permission to delete staff. Please check your Firestore Security Rules.", variant: "destructive", duration: 7000 });
      } else {
        toast({ title: "Error Deleting Staff", description: `Could not remove staff: ${error.message || 'Unknown error'}`, variant: "destructive" });
      }
    } finally {
      setIsDeleteStaffAlertOpen(false);
      setStaffToDelete(null);
      setIsSubmitting(false);
    }
  };

  const getTeamNameById = (teamId?: string) => {
    if (!teamId || teamId === 'no-team' || !teamsListCache) return 'N/A';
    return teamsListCache.find(t => t.id === teamId)?.name || 'Unknown Team';
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
            <Button onClick={() => handleOpenAddStaffDialog()} disabled={!companyId || (teamsListCache === null && !authLoading) /* Disable if teams still loading for selection */}>
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
      {staffListCache && filteredStaffList.length > 5 && (
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">Showing {filteredStaffList.length} of {staffListCache.length} staff members.</p>
        </CardFooter>
      )}

      <Suspense fallback={<Skeleton className="w-[90vw] max-w-md h-[500px]"/>}>
        {isAddStaffDialogOpen && companyId && (
            <AddEditStaffDialog
                isOpen={isAddStaffDialogOpen}
                onOpenChange={setIsAddStaffDialogOpen}
                editingStaff={editingStaff}
                teamsList={teamsListCache || []}
                isLoadingTeams={teamsListCache === null}
                companyId={companyId}
                onSaveSuccess={handleSaveStaffSuccess}
            />
        )}
      </Suspense>
      

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
            <AlertDialogAction onClick={handleDeleteStaff} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Yes, delete staff member'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

