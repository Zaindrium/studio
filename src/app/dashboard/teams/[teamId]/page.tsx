
"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users, UserPlus, FileText, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Placeholder data for a single team and its members/templates
const MOCK_TEAM_DETAILS = {
  id: 'team1',
  name: 'Sales Team Alpha',
  description: 'Focused on enterprise client acquisition and regional sales targets.',
  manager: 'Alice Smith',
  members: [
    { id: 'user1', name: 'John Doe', role: 'Sales Rep' },
    { id: 'user2', name: 'Jane Roe', role: 'Sales Lead' },
    { id: 'user3', name: 'Mike Chan', role: 'Account Manager' },
  ],
  assignedTemplates: [
    { id: 'templateA', name: 'Enterprise Sales Card' },
    { id: 'templateB', name: 'Networking Event Card (Sales)' },
  ],
  teamMetrics: {
    cardsCreated: 45,
    averageSharesPerCard: 12,
    leadsGenerated: 150, // Example metric
  }
};

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  // In a real app, fetch team details based on teamId
  const team = MOCK_TEAM_DETAILS; // Using mock data

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
        <Button>
          <Edit className="mr-2 h-4 w-4" /> Edit Team Details
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Members ({team.members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {team.members.map(member => (
                <li key={member.id} className="text-sm p-2 bg-secondary/30 rounded-md">
                  {member.name} <span className="text-xs text-muted-foreground">({member.role})</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-4">
              <UserPlus className="mr-2 h-4 w-4" /> Manage Members
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Assigned Templates ({team.assignedTemplates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {team.assignedTemplates.map(template => (
                <li key={template.id} className="text-sm p-2 bg-secondary/30 rounded-md">{template.name}</li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-4">
              Manage Templates
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-primary">Team Performance</CardTitle>
            <CardDescription>Key metrics for this team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Cards Created:</span> <span className="font-semibold">{team.teamMetrics.cardsCreated}</span></div>
            <div className="flex justify-between"><span>Avg. Shares/Card:</span> <span className="font-semibold">{team.teamMetrics.averageSharesPerCard}</span></div>
            <div className="flex justify-between"><span>Leads Generated:</span> <span className="font-semibold">{team.teamMetrics.leadsGenerated}</span></div>
             {/* More metrics could be added here */}
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for team-specific activity feed or settings */}
      <Card>
        <CardHeader>
          <CardTitle>Activity & Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Team activity logs and specific settings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
