
"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, PlusCircle, Search, Edit, Trash2, MoreVertical, Send, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { StaffRecord, UserStatus, Team } from '@/lib/app-types';
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
  deleteField,
  orderBy, 
  limit, 
  startAfter,
  endBefore,
  limitToLast,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

const AddEditStaffDialog = React.lazy(() => import('@/components/dashboard/users/add-edit-staff-dialog'));

const STAFF_PER_PAGE = 10;

const generateUniqueFingerprint = () => {
  return sanitizeForUrl(`staff-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`);
};

export default function UsersPage() {
  const { companyId, loading: authLoading, teamsListCache, fetchAndCacheTeams, fetchAndCacheStaff: fetchAndCacheStaffFromContext } = useAuth();
  const { toast } = useToast();

  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [isDeleteStaffAlertOpen, setIsDeleteStaffAlertOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [lastVisibleStaffDoc, setLastVisibleStaffDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [firstVisibleStaffDocsStack, setFirstVisibleStaffDocsStack] = useState<(QueryDocumentSnapshot | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isFetchingPage, setIsFetchingPage] = useState(false);


  const fetchStaffPage = useCallback(async (direction: 'next' | 'prev' | 'initial' = 'initial') => {
    if (!companyId) {
      setStaffList([]);
      setIsLoadingData(false);
      setIsFetchingPage(false);
      return;
    }
    setIsFetchingPage(true);
    try {
      const staffCollectionRef = collection(db, `companies/${companyId}/staff`);
      let q;

      if (direction === 'next' && lastVisibleStaffDoc) {
        q = query(staffCollectionRef, orderBy("name"), startAfter(lastVisibleStaffDoc), limit(STAFF_PER_PAGE));
      } else if (direction === 'prev' && firstVisibleStaffDocsStack.length > 1) {
        const previousPageFirstDoc = firstVisibleStaffDocsStack[firstVisibleStaffDocsStack.length - 2];
         q = query(staffCollectionRef, orderBy("name"), endBefore(previousPageFirstDoc || undefined), limitToLast(STAFF_PER_PAGE));
      } else { // initial or prev on first page
        q = query(staffCollectionRef, orderBy("name"), limit(STAFF_PER_PAGE));
      }
      
      const querySnapshot = await getDocs(q);
      const fetchedStaff: StaffRecord[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as StaffRecord));
      
      setStaffList(fetchedStaff);
      setLastVisibleStaffDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setIsLastPage(fetchedStaff.length < STAFF_PER_PAGE);

      if (direction === 'initial') {
        setFirstVisibleStaffDocsStack(querySnapshot.docs.length > 0 ? [querySnapshot.docs[0]] : []);
        setCurrentPage(1);
      } else if (direction === 'next' && fetchedStaff.length > 0) {
        setFirstVisibleStaffDocsStack(prev => [...prev, querySnapshot.docs[0]]);
        setCurrentPage(prev => prev + 1);
      } else if (direction === 'prev') {
        setFirstVisibleStaffDocsStack(prev => prev.slice(0, -1));
        setCurrentPage(prev => Math.max(1, prev - 1));
      }

    } catch (error: any) {
      console.error("Error fetching staff:", error);
      if (error.code === 'permission-denied') {
        toast({ title: "Permission Denied", description: "Could not fetch staff list. Check Firestore rules.", variant: "destructive", duration: 7000 });
      } else {
        toast({ title: "Error", description: `Failed to fetch staff: ${error.message || 'Unknown error'}.`, variant: "destructive" });
      }
      setStaffList([]);
    } finally {
      setIsLoadingData(false);
      setIsFetchingPage(false);
    }
  }, [companyId, toast, lastVisibleStaffDoc, firstVisibleStaffDocsStack]);


  useEffect(() => {
    if (!authLoading && companyId) {
        fetchStaffPage('initial');
        if (!teamsListCache) {
            fetchAndCacheTeams(companyId).finally(() => setIsLoadingTeams(false));
        } else {
            setIsLoadingTeams(false);
        }
    } else if (!authLoading && !companyId) {
        setIsLoadingData(false);
        setIsLoadingTeams(false);
        setStaffList([]);
    }
  }, [authLoading, companyId, fetchStaffPage, teamsListCache, fetchAndCacheTeams]);


  const filteredStaffList = useMemo(() => {
    // Search will only apply to the current page of staff members for now
    return staffList.filter(staff =>
      (staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffList, searchTerm]);

  const handleOpenAddStaffDialog = (staffToEdit: StaffRecord | null = null) => {
    setEditingStaff(staffToEdit);
    setIsAddStaffDialogOpen(true);
  };

  const handleSaveStaffSuccess = async () => {
    setIsAddStaffDialogOpen(false);
    setEditingStaff(null);
    if (companyId) {
        await fetchStaffPage('initial'); // Refetch the first page to reflect changes
        await fetchAndCacheStaffFromContext(companyId); // Update context cache (first page)
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
      await fetchStaffPage('initial'); 
      await fetchAndCacheStaffFromContext(companyId);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      if (error.code === 'permission-denied') {
        toast({ title: "Permission Denied", description: "You do not have permission to delete staff. Check Firestore rules.", variant: "destructive", duration: 7000 });
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

  if (authLoading || isLoadingData && !isFetchingPage && currentPage === 1) {
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
            placeholder="Search current page by name or email..." 
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
              {isFetchingPage && staffList.length === 0 && (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading staff...</TableCell></TableRow>
              )}
              {!isFetchingPage && filteredStaffList.length > 0 ? filteredStaffList.map((staff) => (
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
                !isFetchingPage && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm ? `No staff found for "${searchTerm}" on this page.` : "No staff members yet. Click 'Add New Staff' to start."}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="justify-between items-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
            Page {currentPage}
        </p>
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchStaffPage('prev')} 
                disabled={currentPage <= 1 || isFetchingPage}
            >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchStaffPage('next')}
                disabled={isLastPage || isFetchingPage}
            >
                Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
      </CardFooter>

      <Suspense fallback={<Skeleton className="w-[90vw] max-w-md h-[500px]"/>}>
        {isAddStaffDialogOpen && companyId && (
            <AddEditStaffDialog
                isOpen={isAddStaffDialogOpen}
                onOpenChange={setIsAddStaffDialogOpen}
                editingStaff={editingStaff}
                teamsList={teamsListCache || []}
                isLoadingTeams={isLoadingTeams}
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
            <AlertDialogCancel onClick={() => setStaffToDelete(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Yes, delete staff member'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

    