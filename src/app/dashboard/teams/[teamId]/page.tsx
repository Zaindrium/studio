
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Interfaces for mock data structures
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AssignedTemplate {
  id: string;
  name: string;
}

interface TeamMetrics {
  cardsCreated: number;
  averageSharesPerCard: number;
  leadsGenerated: number;
  activeMembers: number;
}

interface DetailedTeam {
  id: string;
  name: string;
  description: string;
  manager: string;
  members: TeamMember[];
  assignedTemplates: AssignedTemplate[];
  teamMetrics: TeamMetrics;
}

interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  // Add other relevant user fields if necessary for selection logic
}


// Placeholder data for a list of detailed teams for this page
const MOCK_DETAILED_TEAMS_DATA: DetailedTeam[] = [
  {
    id: 'team1',
    name: 'Sales Team Alpha',
    description: 'Focused on enterprise client acquisition and regional sales targets.',
    manager: 'Alice Smith',
    members: [
      { id: 'user1', name: 'John Doe', role: 'Sales Rep', email: 'john.doe@example.com' },
      { id: 'user2', name: 'Jane Roe', role: 'Sales Lead', email: 'jane.roe@example.com' },
      { id: 'user3', name: 'Mike Chan', role: 'Account Manager', email: 'mike.chan@example.com' },
    ],
    assignedTemplates: [
      { id: 'templateA', name: 'Enterprise Sales Card' },
      { id: 'templateB', name: 'Networking Event Card (Sales)' },
    ],
    teamMetrics: {
      cardsCreated: 45,
      averageSharesPerCard: 12,
      leadsGenerated: 150,
      activeMembers: 3,
    }
  },
  {
    id: 'team2',
    name: 'Marketing Crew Gamma',
    description: 'Digital marketing, content creation, and brand management.',
    manager: 'Bob Johnson',
    members: [
      { id: 'user4', name: 'Sarah Lee', role: 'Content Strategist', email: 'sarah.lee@example.com' },
      { id: 'user5', name: 'Tom Wilson', role: 'SEO Specialist', email: 'tom.wilson@example.com' },
    ],
    assignedTemplates: [
      { id: 'templateC', name: 'Brand Awareness Card' },
    ],
    teamMetrics: {
      cardsCreated: 30,
      averageSharesPerCard: 18,
      leadsGenerated: 95,
      activeMembers: 2,
    }
  },
  {
    id: 'team3',
    name: 'Engineering Squad Beta',
    description: 'Product development and R&D for core platform features.',
    manager: 'Carol White',
    members: [
      { id: 'user6', name: 'David Kim', role: 'Backend Developer', email: 'david.kim@example.com' },
      { id: 'user7', name: 'Laura Chen', role: 'Frontend Developer', email: 'laura.chen@example.com' },
      { id: 'user8', name: 'Kevin Green', role: 'QA Engineer', email: 'kevin.green@example.com' },
    ],
    assignedTemplates: [
      { id: 'templateD', name: 'Developer Profile Card' },
    ],
    teamMetrics: {
      cardsCreated: 15,
      averageSharesPerCard: 5,
      leadsGenerated: 10,
      activeMembers: 3,
    }
  }
];

const MOCK_ORGANIZATION_USERS: OrganizationUser[] = [
    { id: 'user1', name: 'John Doe', email: 'john.doe@example.com' },
    { id: 'user2', name: 'Jane Roe', email: 'jane.roe@example.com' },
    { id: 'user3', name: 'Mike Chan', email: 'mike.chan@example.com' },
    { id: 'user4', name: 'Sarah Lee', email: 'sarah.lee@example.com' },
    { id: 'user5', name: 'Tom Wilson', email: 'tom.wilson@example.com' },
    { id: 'user6', name: 'David Kim', email: 'david.kim@example.com' },
    { id: 'user7', name: 'Laura Chen', email: 'laura.chen@example.com' },
    { id: 'user8', name: 'Kevin Green', email: 'kevin.green@example.com' },
    { id: 'user9', name: 'Olivia Brown', email: 'olivia.brown@example.com' },
    { id: 'user10', name: 'Chris Davis', email: 'chris.davis@example.com' },
    { id: 'user11', name: 'Patricia Miller', email: 'patricia.miller@example.com' },
    { id: 'user12', name: 'James Wilson', email: 'james.wilson@example.com' },
];


export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { toast } = useToast();

  const [currentTeam, setCurrentTeam] = useState<DetailedTeam | null>(null);
  const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = useState(false);
  
  useEffect(() => {
    const foundTeam = MOCK_DETAILED_TEAMS_DATA.find(t => t.id === teamId);
    // Deep copy to prevent direct mutation of mock data if needed for other parts,
    // or ensure MOCK_DETAILED_TEAMS_DATA is not mutated elsewhere.
    // For this simulation, a shallow copy of members is fine for add/remove.
    if (foundTeam) {
      setCurrentTeam({ ...foundTeam, members: [...foundTeam.members] });
    } else {
      setCurrentTeam(null);
    }
  }, [teamId]);

  const handleDeleteTeam = () => {
    console.log(`Attempting to delete team ${currentTeam?.id}`);
    toast({
      title: "Team Deletion Initiated",
      description: `Team "${currentTeam?.name}" would be deleted. (This is a simulation)`,
      variant: "destructive",
    });
    // In a real app, navigate away or update a global list of teams
    // For simulation, let's redirect back to the teams list
    router.push('/dashboard/teams');
  };

  const handleRemoveMember = (memberId: string) => {
    if (!currentTeam) return;
    const memberToRemove = currentTeam.members.find(m => m.id === memberId);
    setCurrentTeam(prevTeam => {
      if (!prevTeam) return null;
      return {
        ...prevTeam,
        members: prevTeam.members.filter(m => m.id !== memberId),
      };
    });
    toast({
      title: "Member Removed",
      description: `${memberToRemove?.name || 'Member'} has been removed from the team. (Simulation)`,
    });
  };

  const handleAddMember = (userId: string) => {
    if (!currentTeam) return;
    const userToAdd = MOCK_ORGANIZATION_USERS.find(u => u.id === userId);
    if (userToAdd && !currentTeam.members.find(m => m.id === userId)) {
      const newMember: TeamMember = {
        id: userToAdd.id,
        name: userToAdd.name,
        email: userToAdd.email,
        role: 'Member', // Default role
      };
      setCurrentTeam(prevTeam => {
        if (!prevTeam) return null;
        return {
          ...prevTeam,
          members: [...prevTeam.members, newMember],
        };
      });
      toast({
        title: "Member Added",
        description: `${userToAdd.name} has been added to the team. (Simulation)`,
      });
    }
  };

  const availableUsersToAdd = MOCK_ORGANIZATION_USERS.filter(
    orgUser => !currentTeam?.members.find(teamMember => teamMember.id === orgUser.id)
  );


  if (!currentTeam) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Loading Team Data...</h1>
        <p className="text-muted-foreground">If the team is not found, you will be redirected.</p>
        {/* Potentially add a redirect if not found after a timeout or based on an error state */}
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
          <p className="text-muted-foreground">{currentTeam.description}</p>
          <p className="text-sm text-muted-foreground mt-1">Managed by: {currentTeam.manager}</p>
        </div>
        <Button variant="outline">
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
                    {/* Removed individual edit/remove buttons for now, handled by dialog */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No members in this team yet.</p>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button onClick={() => setIsManageMembersDialogOpen(true)} variant="default" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Add/Remove Members
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Assigned Templates ({currentTeam.assignedTemplates.length})</CardTitle>
             <CardDescription>Manage card templates available to this team.</CardDescription>
          </CardHeader>
          <CardContent>
            {currentTeam.assignedTemplates.length > 0 ? (
              <ul className="space-y-2">
                {currentTeam.assignedTemplates.map(template => (
                  <li key={template.id} className="text-sm p-3 bg-secondary/30 rounded-md flex justify-between items-center">
                    {template.name}
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs">Unassign</Button>
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
            <Button variant="default" className="w-full">
              Manage Team Templates
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Manage Members Dialog */}
      <Dialog open={isManageMembersDialogOpen} onOpenChange={setIsManageMembersDialogOpen}>
        <DialogContent className="sm:max-w-2xl"> {/* Wider dialog */}
          <DialogHeader>
            <DialogTitle>Manage Team Members for "{currentTeam.name}"</DialogTitle>
            <DialogDescription>
              Add new members from your organization or remove existing ones from this team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-hidden">
            {/* Current Members */}
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

            {/* Available Users to Add */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">Available Organization Users ({availableUsersToAdd.length})</h3>
               <ScrollArea className="h-[45vh] rounded-md border p-3">
                {availableUsersToAdd.length > 0 ? (
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
                  <p className="text-sm text-muted-foreground text-center py-4">All organization users are already in this team or no other users available.</p>
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
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20 min-h-[60px]">{currentTeam.description}</p>
            </div>
            <div>
                <h4 className="font-medium mb-1">Team Manager</h4>
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20">{currentTeam.manager}</p>
            </div>
             <Button variant="outline" className="w-full">
              <Edit className="mr-2 h-4 w-4" /> Modify Name, Description, or Manager
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Team
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the team
                    "{currentTeam.name}" and remove all associated data. Users in this team will
                    not be deleted but will no longer be part of this team.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTeam}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    