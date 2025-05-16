
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, QrCode, Share2, Users, CreditCard, BarChart3, Percent } from 'lucide-react';
// Assuming a chart component exists, e.g., from shadcn/ui/chart
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';


// Placeholder data for charts - in a real app, this would come from an API / state management
const MOCK_ANALYTICS_DATA = {
  totalCardViews: 1256,
  weeklyCardViews: 152,
  totalScans: 345,
  weeklyScans: 43,
  totalShares: 189,
  weeklyShares: 21,
  totalCards: 78,
  totalUsers: 15,
  planUsagePercent: 60, // e.g. 60% of (user limit or card limit)
};

const weeklyActivityData = [
  { name: 'Mon', views: 20, scans: 5, shares: 2 },
  { name: 'Tue', views: 35, scans: 8, shares: 4 },
  { name: 'Wed', views: 28, scans: 6, shares: 3 },
  { name: 'Thu', views: 42, scans: 10, shares: 5 },
  { name: 'Fri', views: 30, scans: 7, shares: 4 },
  { name: 'Sat', views: 15, scans: 3, shares: 1 },
  { name: 'Sun', views: 12, scans: 4, shares: 2 },
];

const chartConfig = {
  views: { label: "Views", color: "hsl(var(--chart-1))" },
  scans: { label: "Scans", color: "hsl(var(--chart-2))" },
  shares: { label: "Shares", color: "hsl(var(--chart-3))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DashboardPage() {
  const analytics = MOCK_ANALYTICS_DATA; // Use mock data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Card Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCardViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.weeklyCardViews} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.weeklyScans} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.weeklyShares} from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Quota Usage: {analytics.planUsagePercent}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Weekly Activity</CardTitle>
            <CardDescription>Overview of card interactions this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                        <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
                        <Bar dataKey="shares" fill="var(--color-shares)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Card & Plan Overview</CardTitle>
             <CardDescription>Summary of your organization's cards and plan status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Business Cards:</span>
              <span className="font-semibold text-lg">{analytics.totalCards.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Users:</span>
              <span className="font-semibold text-lg">{analytics.totalUsers.toLocaleString()}</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Plan Quota Usage:</span>
                <span className="font-semibold text-primary">{analytics.planUsagePercent}%</span>
              </div>
               {/* Basic progress bar simulation */}
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${analytics.planUsagePercent}%` }}
                ></div>
              </div>
               <p className="text-xs text-muted-foreground mt-1">
                Based on user or card limits of your current plan.
              </p>
            </div>
             <Button className="w-full mt-2">Manage Subscription</Button>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Teams section if included on dashboard overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Teams Overview</CardTitle>
          <CardDescription>Quick glance at your teams. <Link href="/dashboard/teams" className="text-primary hover:underline">Manage Teams</Link></CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Team summaries and quick actions will appear here.</p>
          {/* Example: List a few teams or show team creation prompt */}
        </CardContent>
      </Card>

    </div>
  );
}
