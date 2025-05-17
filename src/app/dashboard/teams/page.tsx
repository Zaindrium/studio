
"use client";

import React, { useState, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, PlusCircle, Search, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog, // Add Dialog if it was missing
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Placeholder data for teams
const MOCK_TEAMS_DATA = [
  { id: 'team1', name: 'Sales Team Alpha', description: 'Handles all sales operations.', memberCount: 12, manager: 'Alice Smith' },
  { id: 'team2', name: 'Marketing Crew Gamma', description: 'Digital and content marketing.', memberCount: 8, manager: 'Bob Johnson' },
  { id: 'team3', name: 'Engineering Squad Beta', description: 'Product development and R&D.', memberCount: 25, manager: 'Carol White' },
  { id: 'team4', name: 'Support Heroes', description: 'Customer support and success.', memberCount: 5, manager: 'David Brown' },
];

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  manager: string;
}

// Dynamically import the Dialog and its content
// const LazyCreateTeamDialog = lazy(() => import('@/components/dashboard/teams/CreateTeamDialog'));
// Note: Since CreateTeamDialog is not a separate component yet, we use the built-in Dialog for now.

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS_DATA); // In real app, fetch from API
  const { toast } = useToast();

  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamManager, setNewTeamManager] = useState('');

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateTeamDialog = () => {
    setNewTeamName('');
    setNewTeamDescription('');
    setNewTeamManager('');
    setIsCreateTeamDialogOpen(true);
  };

  const handleSaveNewTeam = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTeamName.trim() || !newTeamDescription.trim() || !newTeamManager.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields for the new team.",
        variant: "destructive",
      });
      return;
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`, // Simple unique ID generation for demo
      name: newTeamName,
      description: newTeamDescription,
      memberCount: 0, // New teams start with 0 members
      manager: newTeamManager,
    };

    setTeams(prevTeams => [...prevTeams, newTeam]);
    toast({
      title: "Team Created!",
      description: `The team "${newTeam.name}" has been successfully created.`,
    });
    setIsCreateTeamDialogOpen(false);
  };
  
  const handleDeleteTeam = (teamId: string) => {
    console.log("Delete team clicked:", teamId);
    // In a real app, show a confirmation dialog before deleting
    setTeams(teams.filter(team => team.id !== teamId)); 
    toast({
        title: "Team Deleted",
        description: "The team has been removed.",
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
        <Button onClick={handleOpenCreateTeamDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Team
        </Button>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNewTeam}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teamName" className="text-right col-span-1">
                  Name
                </Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Marketing Team"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teamDescription" className="text-right col-span-1">
                  Description
                </Label>
                <Input
                  id="teamDescription"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Responsible for all marketing activities"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teamManager" className="text-right col-span-1">
                  Manager
                </Label>
                <Input
                  id="teamManager"
                  value={newTeamManager}
                  onChange={(e) => setNewTeamManager(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Alex Smith"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Team</Button>
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
            <Button onClick={handleOpenCreateTeamDialog} size="lg">
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
              <CardDescription className="text-xs text-muted-foreground">Managed by: {team.manager}</CardDescription>
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
