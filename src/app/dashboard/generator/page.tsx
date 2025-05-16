
"use client";
// Placeholder - Batch Card Generator Page
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Blocks } from 'lucide-react';

export default function GeneratorPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Blocks className="mr-2 h-6 w-6 text-primary"/>Batch Card Generator</CardTitle>
        <CardDescription>Create multiple business cards at once using a template and a list of user data (e.g., from a CSV file).</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">A tool for batch creating business cards will be implemented here.</p>
        {/* TODO: Implement CSV/Excel upload, data mapping, and batch creation logic. */}
      </CardContent>
    </Card>
  );
}
