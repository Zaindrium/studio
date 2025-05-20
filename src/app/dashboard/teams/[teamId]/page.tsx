
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users, UserPlus, FileText, Edit, ArrowLeft, Settings, Trash2, BarChart3, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { TeamMember, AssignedTemplate, TeamMetrics, DetailedTeam, StaffRecord } from '@/lib/app-types';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc, Timestamp, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import EditTeamDialog from '@/components/dashboard/teams/EditTeamDialog';

interface EditTeamFormState {
  name: string;
  description: string;
  managerId: string | null;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { toast } = useToast();
  const { 
    companyId, 
    loading: authLoading, 
    fetchAndCacheTeams, 
    staffListCache, 
    fetchAndCacheStaff, 
    isInitialDataLoaded // Destructure isInitialDataLoaded
  } = useAuth();

  const [currentTeam, setCurrentTeam] = useState<DetailedTeam | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = useState(false);
  const [isLoadingOrgStaff, setIsLoadingOrgStaff] = useState(true); // Keep this for the dialog
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [isDeleteTeamAlertOpen, setIsDeleteTeamAlertOpen] = useState(false);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  
  const calculateTeamMetrics = (team: DetailedTeam | null): TeamMetrics => {
    if (!team || !team.members || team.members.length === 0) {
      return {
        cardsCreated: 0,
        averageSharesPerCard: 0,
        leadsGenerated: team?.teamMetrics?.leadsGenerated || 0,
        activeMembers: 0,
      };
    }
    const totalCardsCreated = team.members.reduce((sum, member) => sum + (member.cardsCreatedCount || 0), 0);
    const totalSumOfAverageShares = team.members.reduce((sum, member) => sum + (member.averageSharesPerCard || 0), 0);
    const overallAverageShares = team.members.length > 0 ? totalSumOfAverageShares / team.members.length : 0;

    return {
      cardsCreated: totalCardsCreated,
      averageSharesPerCard: parseFloat(overallAverageShares.toFixed(1)),
      leadsGenerated: team.teamMetrics?.leadsGenerated || 0,
      activeMembers: team.members.length,
    };
  };

  const fetchTeamDetails = useCallback(async () => {
    if (!companyId || !teamId) {
      setIsLoadingTeam(false);
      return;
    }
    setIsLoadingTeam(true);
    try {
      const teamDocRef = doc(db, `companies/${companyId}/teams`, teamId);
      const teamDocSnap = await getDoc(teamDocRef);

      if (teamDocSnap.exists()) {
        const teamData = teamDocSnap.data() as Omit<DetailedTeam, 'id' | 'members' | 'teamMetrics'>;
        let members: TeamMember[] = [];
        if (teamData.memberUserIds && teamData.memberUserIds.length > 0) {
          const staffCollectionRef = collection(db, `companies/${companyId}/staff`);
          const membersQuery = query(staffCollectionRef, where('__name__', 'in', teamData.memberUserIds.slice(0,30)));
          const membersSnap = await getDocs(membersQuery);
          members = membersSnap.docs.map(docSnap => {
            const staffData = docSnap.data() as StaffRecord;
            return {
              id: docSnap.id,
              name: staffData.name,
              role: staffData.role,
              email: staffData.email,
              cardsCreatedCount: staffData.cardsCreatedCount || 0,
              averageSharesPerCard: 0, 
            };
          });
        }
        const fullTeamData: DetailedTeam = {
          id: teamDocSnap.id,
          ...teamData,
          members,
          assignedTemplates: teamData.assignedTemplates || [],
          teamMetrics: { leadsGenerated: 0, ...teamData.teamMetrics },
        };
        fullTeamData.teamMetrics = calculateTeamMetrics(fullTeamData);
        setCurrentTeam(fullTeamData);
      } else {
        toast({ title: "Error", description: "Team not found.", variant: "destructive" });
        setCurrentTeam(null);
        router.push('/dashboard/teams');
      }
    } catch (error: any) {
      console.error("Error fetching team details:", error);
      if (error.code === 'permission-denied') {
        toast({ title: "Permission Denied", description: "You do not have permission to view this team.", variant: "destructive"});
      } else {
        toast({ title: "Error Fetching Team", description: `Could not fetch team details: ${error.message}` , variant: "destructive" });
      }
    } finally {
      setIsLoadingTeam(false);
    }
  }, [companyId, teamId, toast, router]);

  // useEffect for fetching team details (remains largely the same)
  useEffect(() => {
    if (!authLoading && companyId) {
      fetchTeamDetails();
    } else if (!authLoading && !companyId) {
      setIsLoadingTeam(false);
    }
  }, [authLoading, companyId, fetchTeamDetails]);

  // useEffect for managing staff loading state based on AuthContext
  useEffect(() => {
    if (authLoading) {
      setIsLoadingOrgStaff(true);
    } else if (companyId && !isInitialDataLoaded) {
      // Auth is done, companyId is present, but initial context data (including staff) might still be loading
      setIsLoadingOrgStaff(true);
    } else if (companyId && isInitialDataLoaded) {
      // Auth is done, companyId is present, and initial context data has been loaded
      // At this point, staffListCache from context is the source of truth for already fetched staff.
      // If it's null, it means no staff or fetch failed in context, but context loading is "done".
      setIsLoadingOrgStaff(false); 
      // If staffListCache is null and you absolutely need staff for this page to function,
      // you could dispatch another fetchAndCacheStaff(companyId) here,
      // but it might conflict with context's own management.
      // For now, we assume context handles it, and if staffListCache is null, there's no staff.
    } else {
      // No companyId or other edge cases
      setIsLoadingOrgStaff(false);
    }
  }, [authLoading, companyId, isInitialDataLoaded, staffListCache]);


  const handleOpenEditTeamDialog = () => {
    if (currentTeam) {
      setIsEditTeamDialogOpen(true);
    }
  };

  const handleUpdateTeam = async (updatedData: EditTeamFormState) => {
    if (!currentTeam || !companyId) {
      toast({ title: "Error", description: "Cannot update team: Missing critical data.", variant: "destructive" });
      return Promise.reject(new Error("Missing critical data for team update"));
    }
    
    const { name, description, managerId } = updatedData;
    let managerName: string | null = null;

    if (managerId && managerId !== 'no-manager' && staffListCache) {
      const manager = staffListCache.find(staff => staff.id === managerId);
      if (manager) {
        managerName = manager.name;
      }
    } 

    const teamDocRef = doc(db, `companies/${companyId}/teams`, currentTeam.id);
    try {
      await updateDoc(teamDocRef, {
        name: name,
        description: description,
        managerId: managerId === 'no-manager' ? null : managerId,
        managerName: managerName, 
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Team Updated", description: `"${name}" has been successfully updated.` });
      await fetchTeamDetails(); 
      await fetchAndCacheTeams(companyId); 
      setIsEditTeamDialogOpen(false); 
    } catch (error: any) {
      console.error("Error updating team:", error);
      if (error.code === 'permission-denied') {
        toast({ title: "Permission Denied", description: "You do not have permission to update this team.", variant: "destructive"});
      } else {
        toast({ title: "Error Updating Team", description: `Could not update team: ${error.message}`, variant: "destructive" });
      }
      throw error; 
    }
  };

  const handleDeleteTeam = async () => {
    if (!currentTeam || !companyId) return;
    setIsDeletingTeam(true);
    try {
      const teamDocRef = doc(db, `companies/${companyId}/teams`, currentTeam.id);
      await deleteDoc(teamDocRef);
      toast({
        title: "Team Deleted",
        description: `Team "${currentTeam.name}" has been deleted.`,
        variant: "default",
      });
      await fetchAndCacheTeams(companyId);
      router.push('/dashboard/teams');
    } catch (error: any) {
      console.error("Error deleting team:", error);
      if (error.code === 'permission-denied') {
         toast({ title: "Permission Denied", description: "You do not have permission to delete this team.", variant: "destructive"});
      } else {
        toast({ title: "Error Deleting Team", description: `Could not delete team: ${error.message}` , variant: "destructive" });
      }
    } finally {
        setIsDeletingTeam(false);
        setIsDeleteTeamAlertOpen(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam || !companyId) return;
    const memberToRemove = currentTeam.members.find(m => m.id === memberId);
    setIsLoadingOrgStaff(true); // Indicate loading while members change
    try {
      const teamDocRef = doc(db, `companies/${companyId}/teams`, currentTeam.id);
      await updateDoc(teamDocRef, {
        memberUserIds: arrayRemove(memberId),
        memberCount: increment(-1)
      });
      await fetchTeamDetails(); 
      await fetchAndCacheTeams(companyId); // This might trigger context-based staffListCache update too
      toast({
        title: "Member Removed",
        description: `${memberToRemove?.name || 'Member'} has been removed from the team.`,
      });
    } catch (error: any) {
      console.error("Error removing member:", error);
      if (error.code === 'permission-denied') {
        toast({ title: "Permission Denied", description: "You do not have permission to remove members.", variant: "destructive"});
      } else {
        toast({ title: "Error Removing Member", description: `Could not remove member: ${error.message}` , variant: "destructive" });
      }
    } finally {
      setIsLoadingOrgStaff(false); // Reset loading state
    }
  };

  const handleAddMember = async (staffId: string) => {
    if (!currentTeam || !companyId || !staffListCache) return;
    const staffToAdd = staffListCache.find(u => u.id === staffId);
    if (staffToAdd && !currentTeam.members.find(m => m.id === staffId)) {
      setIsLoadingOrgStaff(true); // Indicate loading while members change
      try {
        const teamDocRef = doc(db, `companies/${companyId}/teams`, currentTeam.id);
        await updateDoc(teamDocRef, {
          memberUserIds: arrayUnion(staffId),
          memberCount: increment(1)
        });
        await fetchTeamDetails(); 
        await fetchAndCacheTeams(companyId); // This might trigger context-based staffListCache update too
        toast({
          title: "Member Added",
          description: `${staffToAdd.name} has been added to the team.`,
        });
      } catch (error: any) {
        console.error("Error adding member:", error);
        if (error.code === 'permission-denied') {
          toast({ title: "Permission Denied", description: "You do not have permission to add members.", variant: "destructive"});
        } else {
          toast({ title: "Error Adding Member", description: `Could not add member: ${error.message}` , variant: "destructive" });
        }
      } finally {
        setIsLoadingOrgStaff(false); // Reset loading state
      }
    }
  };
  
  const availableUsersToAdd = staffListCache ? staffListCache.filter(
    orgUser => !currentTeam?.members.find(teamMember => teamMember.id === orgUser.id)
  ) : [];

  // Main page loading state (for team details)
  if (authLoading || isLoadingTeam) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Team Not Found</h1>
        <p className="text-muted-foreground">This team does not exist or you may not have permission to view it.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/teams">Go Back to All Teams</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/dashboard/teams">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Teams
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{currentTeam.name}</h1>
          <p className="text-muted-foreground">{currentTeam.description || 'No description provided.'}</p>
          <p className="text-sm text-muted-foreground mt-1">Managed by: {currentTeam.managerName || 'N/A'}</p>
        </div>
        <Button variant="outline" onClick={handleOpenEditTeamDialog} disabled={!currentTeam}>
          <Edit className="mr-2 h-4 w-4" /> Edit Team Details
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Team Members ({currentTeam.members.length})</CardTitle>
            <CardDescription>View and manage members of this team.</CardDescription>
          </CardHeader>
          <CardContent>
            {currentTeam.members.length > 0 ? (
              <ul className="space-y-3">
                {currentTeam.members.map(member => (
                  <li key={member.id} className="flex items-center justify-between text-sm p-3 bg-secondary/30 rounded-md">
                    <div>
                      <span className="font-medium">{member.name}</span> <Badge variant="outline" className="ml-2 text-xs">{member.role}</Badge>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No members in this team yet.</p>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            {/* Button to open Manage Members Dialog, disabled based on isLoadingOrgStaff */}
            <Button onClick={() => setIsManageMembersDialogOpen(true)} variant="default" className="w-full" disabled={isLoadingOrgStaff}>
              <UserPlus className="mr-2 h-4 w-4" /> {isLoadingOrgStaff ? 'Loading Staff...' : 'Add/Remove Members'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Assigned Templates ({currentTeam.assignedTemplates?.length || 0})</CardTitle>
             <CardDescription>Manage card templates available to this team.</CardDescription>
          </CardHeader>
          <CardContent>
            {(currentTeam.assignedTemplates || []).length > 0 ? (
              <ul className="space-y-2">
                {currentTeam.assignedTemplates.map(template => (
                  <li key={template.id} className="text-sm p-3 bg-secondary/30 rounded-md flex justify-between items-center">
                    {template.name}
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs" disabled>Unassign</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No templates specifically assigned to this team.</p>
            )}
             <p className="text-xs text-muted-foreground mt-3">
                Assign templates from the main <Link href="/dashboard/templates" className="text-primary hover:underline">Templates library</Link>.
            </p>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="default" className="w-full" disabled>
              Manage Team Templates
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isManageMembersDialogOpen} onOpenChange={setIsManageMembersDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col"> 
          <DialogHeader>
            <DialogTitle>Manage Team Members for "{currentTeam.name}"</DialogTitle>
            <DialogDescription>
              Add new members from your organization or remove existing ones from this team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">Current Members ({currentTeam.members.length})</h3>
              <ScrollArea className="h-[45vh] rounded-md border p-3">
                {currentTeam.members.length > 0 ? (
                  <ul className="space-y-2">
                    {currentTeam.members.map(member => (
                      <li key={`current-${member.id}`} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email} - <span className="italic">{member.role}</span></p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)} aria-label={`Remove ${member.name}`}>
                          <UserMinus className="h-4 w-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No members in this team.</p>
                )}
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">Available Organization Staff ({availableUsersToAdd.length})</h3>
               <ScrollArea className="h-[45vh] rounded-md border p-3">
                 {/* Skeleton for available staff list, controlled by isLoadingOrgStaff */}
                 {isLoadingOrgStaff ? <Skeleton className="h-20 w-full" /> : 
                  availableUsersToAdd.length > 0 ? (
                  <ul className="space-y-2">
                    {availableUsersToAdd.map(user => (
                      <li key={`available-${user.id}`} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                         <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => handleAddMember(user.id)} aria-label={`Add ${user.name}`}>
                          <UserPlus className="h-4 w-4 text-primary" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">All organization staff are in this team or no other staff available.</p>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Team Performance</CardTitle>
            <CardDescription>Key metrics for {currentTeam.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Active Members:</span> <span className="font-semibold text-lg">{currentTeam.teamMetrics.activeMembers}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Total Cards Created:</span> <span className="font-semibold text-lg">{currentTeam.teamMetrics.cardsCreated}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Avg. Shares/Card:</span> <span className="font-semibold text-lg">{currentTeam.teamMetrics.averageSharesPerCard}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Leads Generated (Example):</span> <span className="font-semibold text-lg">{currentTeam.teamMetrics.leadsGenerated}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Settings className="mr-2 h-5 w-5 text-primary"/>Team Settings & Actions</CardTitle>
            <CardDescription>Advanced configuration and actions for this team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h4 className="font-medium mb-1">Team Name</h4>
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20">{currentTeam.name}</p>
            </div>
            <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20 min-h-[60px]">{currentTeam.description || 'No description provided.'}</p>
            </div>
            <div>
                <h4 className="font-medium mb-1">Team Manager</h4>
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20">{currentTeam.managerName || 'N/A'}</p>
            </div>
             <Button variant="outline" className="w-full" onClick={handleOpenEditTeamDialog} disabled={!currentTeam}>
              <Edit className="mr-2 h-4 w-4" /> Modify Name, Description, or Manager
            </Button>
            <AlertDialog open={isDeleteTeamAlertOpen} onOpenChange={setIsDeleteTeamAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" onClick={() => setIsDeleteTeamAlertOpen(true)} disabled={isDeletingTeam}>
                  {isDeletingTeam ? 'Deleting...' : <><Trash2 className="mr-2 h-4 w-4" /> Delete Team</>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the team
                    "{currentTeam.name}" and remove all associated data. Staff in this team will
                    not be deleted but will no longer be part of this team.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteTeamAlertOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTeam} disabled={isDeletingTeam}>
                    {isDeletingTeam ? 'Deleting...' : 'Yes, delete team'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {currentTeam && (
        <EditTeamDialog
          open={isEditTeamDialogOpen}
          onOpenChange={setIsEditTeamDialogOpen}
          team={currentTeam} 
          staffList={staffListCache || []} 
          onSave={handleUpdateTeam} 
          isLoadingStaff={isLoadingOrgStaff} // Pass this state to the dialog
        />
      )}
    </div>
  );
}
