
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, PlusCircle, Search, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
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
import { useToast } from "@/hooks/use-toast";
import type { Team, StaffRecord } from '@/lib/app-types';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// MOCK_TEAMS_DATA is removed. Teams will be fetched or start empty.

interface NewTeamFormState {
  name: string;
  description: string;
  managerId?: string;
}

const initialNewTeamState: NewTeamFormState = {
    name: '',
    description: '',
    managerId: 'no-manager', // Default to 'no-manager'
};

export default function TeamsPage() {
  const { currentUser, companyId, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<Team[]>([]); // Initialize with an empty array
  const { toast } = useToast();

  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [newTeamForm, setNewTeamForm] = useState<NewTeamFormState>(initialNewTeamState);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!companyId) {
        if (!authLoading) {
            // Toast removed as per previous discussion for a cleaner startup
            // toast({ title: "Error", description: "Company ID not available to fetch staff.", variant: "destructive" });
        }
        return;
    }
    setIsLoadingStaff(true);
    try {
      const staffCollectionRef = collection(db, `companies/${companyId}/staff`);
      const q = query(staffCollectionRef);
      const querySnapshot = await getDocs(q);
      const fetchedStaff: StaffRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedStaff.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())).toISOString(),
          updatedAt: (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())).toISOString(),
          lastLoginAt: data.lastLoginAt instanceof Timestamp ? data.lastLoginAt.toDate().toLocaleString() : data.lastLoginAt || '-',
        } as StaffRecord);
      });
      setStaffList(fetchedStaff);
      // Do not automatically select the first staff member if the list is not empty.
      // Keep the default 'no-manager' or the current selection.
      // setNewTeamForm(prev => ({...prev, managerId: fetchedStaff.length > 0 && !prev.managerId ? fetchedStaff[0].id : (prev.managerId || 'no-manager')}));
    } catch (error) {
      console.error("Error fetching staff for manager selection:", error);
      toast({ title: "Error", description: "Could not fetch staff list for manager selection.", variant: "destructive" });
    } finally {
      setIsLoadingStaff(false);
    }
  }, [companyId, toast, authLoading]);

  useEffect(() => {
    if (!authLoading && companyId) {
        fetchStaff();
    }
    // TODO: Add fetching of teams from Firestore here once backend is ready
    // For now, teams list remains empty or populated by client-side additions
  }, [authLoading, companyId, fetchStaff]);


  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateTeamDialog = () => {
    setNewTeamForm(initialNewTeamState); // Reset form, managerId will be 'no-manager'
    setIsCreateTeamDialogOpen(true);
  };

  const handleFormChange = (field: keyof NewTeamFormState, value: string) => {
    setNewTeamForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNewTeam = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTeamForm.name?.trim() || !newTeamForm.description?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out Name and Description for the new team.",
        variant: "destructive",
      });
      return;
    }
    // Manager is now optional, so no need to validate newTeamForm.managerId here

    const manager = newTeamForm.managerId && newTeamForm.managerId !== 'no-manager'
                    ? staffList.find(staff => staff.id === newTeamForm.managerId)
                    : undefined;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamForm.name,
      description: newTeamForm.description,
      memberCount: 0,
      managerId: manager ? manager.id : undefined,
      managerName: manager ? manager.name : undefined, // Or 'N/A' or leave undefined
      createdAt: new Date().toISOString(),
    };

    setTeams(prevTeams => [newTeam, ...prevTeams]);
    toast({
      title: "Team Created!",
      description: `The team "${newTeam.name}" has been successfully created.`,
    });
    setIsCreateTeamDialogOpen(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
    toast({
        title: "Team Deleted",
        description: "The team has been removed. (Simulation)",
        variant: "default"
    });
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams by name or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenCreateTeamDialog} disabled={!companyId}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Team
        </Button>
      </div>

      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new team. Manager assignment is optional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewTeam}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newTeamName">Team Name</Label>
                <Input
                  id="newTeamName"
                  value={newTeamForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Marketing Team"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTeamDescription">Description</Label>
                <Input
                  id="newTeamDescription"
                  value={newTeamForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="e.g., Responsible for all marketing activities"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTeamManager">Manager (Optional)</Label>
                {isLoadingStaff ? (
                    <Skeleton className="h-10 w-full" />
                ) : (
                    <Select
                        value={newTeamForm.managerId}
                        onValueChange={(value) => handleFormChange('managerId', value)}
                    >
                        <SelectTrigger id="newTeamManager">
                        <SelectValue placeholder="Select a manager (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="no-manager">No Manager (Assign Later)</SelectItem>
                        {staffList.map(staff => (
                            <SelectItem key={staff.id} value={staff.id}>{staff.name} ({staff.email})</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                )}
                {staffList.length === 0 && !isLoadingStaff && (
                    <p className="text-xs text-muted-foreground">No staff available to assign as manager.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={!companyId}>Save Team</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {filteredTeams.length === 0 && searchTerm && (
        <Card className="text-center py-8">
          <CardHeader>
            <CardTitle>No Teams Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your search for "{searchTerm}" did not match any teams.</p>
            <Button variant="link" onClick={() => setSearchTerm('')}>Clear Search</Button>
          </CardContent>
        </Card>
      )}

      {filteredTeams.length === 0 && !searchTerm && (
         <Card className="text-center py-12">
          <CardHeader>
             <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">No Teams Created Yet</CardTitle>
            <CardDescription>Get started by creating your first team to organize users and assign resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleOpenCreateTeamDialog} size="lg" disabled={!companyId}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Link href={`/dashboard/teams/${team.id}`} legacyBehavior passHref>
                    <a className="hover:underline">
                        <CardTitle className="text-xl mb-1">{team.name}</CardTitle>
                    </a>
                </Link>
              </div>
              <CardDescription className="text-xs text-muted-foreground">Managed by: {team.managerName || 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3 min-h-[40px]">{team.description}</p>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span>{team.memberCount} Members</span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/teams/${team.id}`}>
                        <Settings className="mr-1 h-4 w-4" /> Manage
                    </Link>
                </Button>
                 <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTeam(team.id)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
