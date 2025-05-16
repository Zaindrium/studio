
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, PlusCircle, Search, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Placeholder data for teams
const MOCK_TEAMS_DATA = [
  { id: 'team1', name: 'Sales Team', description: 'Handles all sales operations.', memberCount: 12, manager: 'Alice Smith' },
  { id: 'team2', name: 'Marketing Crew', description: 'Digital and content marketing.', memberCount: 8, manager: 'Bob Johnson' },
  { id: 'team3', name: 'Engineering Squad', description: 'Product development and R&D.', memberCount: 25, manager: 'Carol White' },
  { id: 'team4', name: 'Support Heroes', description: 'Customer support and success.', memberCount: 5, manager: 'David Brown' },
];

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState(MOCK_TEAMS_DATA); // In real app, fetch from API

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Placeholder functions for actions
  const handleCreateTeam = () => console.log("Create new team clicked");
  const handleManageTeam = (teamId: string) => console.log("Manage team clicked:", teamId);
  const handleDeleteTeam = (teamId: string) => {
    console.log("Delete team clicked:", teamId);
    // setTeams(teams.filter(team => team.id !== teamId)); // Example: Optimistic update
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
        <Button onClick={handleCreateTeam}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Team
        </Button>
      </div>

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
            <Button onClick={handleCreateTeam} size="lg">
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
                {/* Quick actions - more can be added in a dropdown */}
              </div>
              <CardDescription className="text-xs text-muted-foreground">Managed by: {team.manager}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-3 min-h-[40px]">{team.description}</p>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span>{team.memberCount} Members</span>
              </div>
              {/* Could add team-specific metrics here if available */}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleManageTeam(team.id)}>
                    <Settings className="mr-1 h-4 w-4" /> Manage
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
