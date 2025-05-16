
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users, UserPlus, FileText, Edit, ArrowLeft, Settings, Trash2, BarChart3 } from 'lucide-react';
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

// Placeholder data for a single team and its members/templates
const MOCK_TEAM_DETAILS = {
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
};

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { toast } = useToast();

  // In a real app, fetch team details based on teamId
  const team = MOCK_TEAM_DETAILS; // Using mock data

  const handleDeleteTeam = () => {
    // Placeholder for actual delete logic
    console.log(`Attempting to delete team ${teamId}`);
    toast({
      title: "Team Deletion Initiated",
      description: `Team "${team.name}" would be deleted. (This is a simulation)`,
      variant: "destructive",
    });
  };

  if (!team || team.id !== teamId) { // Basic check for mock data
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Team Not Found</h1>
        <p className="text-muted-foreground">The team you are looking for does not exist or could not be loaded.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/teams">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
          </Link>
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
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">{team.description}</p>
          <p className="text-sm text-muted-foreground mt-1">Managed by: {team.manager}</p>
        </div>
        {/* This button would typically open a modal/dialog to edit team name, description, manager */}
        <Button variant="outline"> 
          <Edit className="mr-2 h-4 w-4" /> Edit Team Details 
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Team Members ({team.members.length})</CardTitle>
            <CardDescription>View and manage members of this team.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {team.members.map(member => (
                <li key={member.id} className="flex items-center justify-between text-sm p-3 bg-secondary/30 rounded-md">
                  <div>
                    <span className="font-medium">{member.name}</span> <span className="text-xs text-muted-foreground">({member.role})</span>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <div>
                    {/* Placeholder actions for each member */}
                    <Button variant="ghost" size="sm" className="mr-1 text-xs">Edit Role</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs">Remove</Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="border-t pt-4">
            {/* This button would open a dialog to add existing users to this team */}
            <Button variant="default" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Add/Remove Members
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Assigned Templates ({team.assignedTemplates.length})</CardTitle>
             <CardDescription>Manage card templates available to this team.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {team.assignedTemplates.map(template => (
                <li key={template.id} className="text-sm p-3 bg-secondary/30 rounded-md flex justify-between items-center">
                  {template.name}
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs">Unassign</Button>
                </li>
              ))}
            </ul>
             <p className="text-xs text-muted-foreground mt-3">
                Assign templates from the main <Link href="/dashboard/templates" className="text-primary hover:underline">Templates library</Link>.
            </p>
          </CardContent>
          <CardFooter className="border-t pt-4">
            {/* This button would open a dialog to assign/unassign templates */}
            <Button variant="default" className="w-full">
              Manage Team Templates
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Team Performance</CardTitle>
            <CardDescription>Key metrics for {team.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Active Members:</span> <span className="font-semibold text-lg">{team.teamMetrics.activeMembers}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Total Cards Created:</span> <span className="font-semibold text-lg">{team.teamMetrics.cardsCreated}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Avg. Shares/Card:</span> <span className="font-semibold text-lg">{team.teamMetrics.averageSharesPerCard}</span></div>
            <div className="flex justify-between items-center p-2 rounded bg-secondary/20"><span>Leads Generated (Example):</span> <span className="font-semibold text-lg">{team.teamMetrics.leadsGenerated}</span></div>
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
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20">{team.name}</p>
            </div>
            <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20 min-h-[60px]">{team.description}</p>
            </div>
            <div>
                <h4 className="font-medium mb-1">Team Manager</h4>
                <p className="text-sm text-muted-foreground p-2 border rounded bg-secondary/20">{team.manager}</p>
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
                    "{team.name}" and remove all associated data. Users in this team will
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

