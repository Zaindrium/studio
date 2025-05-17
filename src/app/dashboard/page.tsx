
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, QrCode, Share2, Users, CreditCard, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Removed MOCK_ANALYTICS_DATA and weeklyActivityData

const chartConfig = {
  views: { label: "Views", color: "hsl(var(--chart-1))" },
  scans: { label: "Scans", color: "hsl(var(--chart-2))" },
  shares: { label: "Shares", color: "hsl(var(--chart-3))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DashboardPage() {
  // In a real app, this data would be fetched from an API / state management
  // For now, we'll use placeholders or indicate loading
  const [analytics, setAnalytics] = React.useState<any>(null); // Use any for now
  const [weeklyActivity, setWeeklyActivity] = React.useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching data
    // TODO: Replace with actual data fetching from Firestore/backend
    setTimeout(() => {
      setAnalytics({ // Minimal placeholder data
        totalCardViews: 0,
        weeklyCardViews: 0,
        totalScans: 0,
        weeklyScans: 0,
        totalShares: 0,
        weeklyShares: 0,
        totalCards: 0,
        totalUsers: 0,
        planUsagePercent: 0,
      });
      setWeeklyActivity([]);
      setIsLoadingAnalytics(false);
    }, 1500); // Simulate network delay
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Card Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{analytics?.totalCardViews?.toLocaleString() ?? 'N/A'}</div>}
            {isLoadingAnalytics ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-xs text-muted-foreground">+{analytics?.weeklyCardViews ?? 0} from last week</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{analytics?.totalScans?.toLocaleString() ?? 'N/A'}</div>}
            {isLoadingAnalytics ? <Skeleton className="h-4 w-28 mt-1" /> : <p className="text-xs text-muted-foreground">+{analytics?.weeklyScans ?? 0} from last week</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{analytics?.totalShares?.toLocaleString() ?? 'N/A'}</div>}
            {isLoadingAnalytics ? <Skeleton className="h-4 w-24 mt-1" /> : <p className="text-xs text-muted-foreground">+{analytics?.weeklyShares ?? 0} from last week</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{analytics?.totalUsers?.toLocaleString() ?? 'N/A'}</div>}
            {isLoadingAnalytics ? <Skeleton className="h-4 w-20 mt-1" /> : <p className="text-xs text-muted-foreground">Quota Usage: {analytics?.planUsagePercent ?? 0}%</p>}
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
            {isLoadingAnalytics ? <Skeleton className="h-full w-full" /> : (
              weeklyActivity.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={weeklyActivity}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                            <Bar dataKey="scans" fill="var(--color-scans)" radius={4} />
                            <Bar dataKey="shares" fill="var(--color-shares)" radius={4} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No weekly activity data yet.</div>
              )
            )}
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
              {isLoadingAnalytics ? <Skeleton className="h-6 w-10" /> : <span className="font-semibold text-lg">{analytics?.totalCards?.toLocaleString() ?? 'N/A'}</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Staff:</span>
              {isLoadingAnalytics ? <Skeleton className="h-6 w-8" /> : <span className="font-semibold text-lg">{analytics?.totalUsers?.toLocaleString() ?? 'N/A'}</span>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Plan Quota Usage:</span>
                {isLoadingAnalytics ? <Skeleton className="h-5 w-12" /> : <span className="font-semibold text-primary">{analytics?.planUsagePercent ?? 0}%</span>}
              </div>
              {isLoadingAnalytics ? <Skeleton className="h-2.5 w-full rounded-full" /> : (
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${analytics?.planUsagePercent ?? 0}%` }}
                  ></div>
                </div>
              )}
               <p className="text-xs text-muted-foreground mt-1">
                Based on user or card limits of your current plan.
              </p>
            </div>
            <Link href="/dashboard/license" passHref>
                <Button className="w-full mt-2" asChild><a>Manage Subscription</a></Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Teams Overview</CardTitle>
          <CardDescription>Quick glance at your teams. <Link href="/dashboard/teams" className="text-primary hover:underline">Manage Teams</Link></CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Team summaries and quick actions will appear here once data is available.</p>
          {/* TODO: Fetch and display summary team data */}
        </CardContent>
      </Card>

    </div>
  );
}
