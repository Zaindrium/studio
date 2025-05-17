
"use client";

import React, { useEffect, useState } from 'react';
import '../globals.css';
import { Link as LinkIcon, LayoutDashboard, Users, CreditCard, FileText, Settings, LifeBuoy, LogOut, Building, Contact, UserCog, KeyRound, Blocks, Puzzle, ShoppingCart, Lock } from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrentPlan, type PlanId } from '@/hooks/use-current-plan';
import type { AdminUser } from '@/lib/app-types'; // Updated to AdminUser

// Simulated admin user data - replace with actual auth context later
const MOCK_ADMIN_USER: AdminUser & { organizationName: string, avatarUrl?: string } = { // Extended for display
  id: "admin-user-123",
  companyId: "company-abc-789",
  organizationName: "Example Corp", // This comes from the CompanyProfile linked to the admin
  name: "Admin LoggedIn",
  email: "admin@examplecorp.com",
  role: 'Owner', // Example admin role
  status: 'Active',
  avatarUrl: "https://placehold.co/40x40.png",
  createdAt: new Date().toISOString(),
};

const sidebarNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/teams', label: 'Teams', icon: Users, isPremium: true },
  { href: '/dashboard/users', label: 'Users', icon: UserCog }, // Managing staff/users
  { href: '/dashboard/business-cards', label: 'Business Cards', icon: CreditCard }, // Admin manages staff cards
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/generator', label: 'Generator', icon: Blocks, isPremium: true },
  { href: '/dashboard/physical-cards', label: 'Physical Cards', icon: ShoppingCart, isPremium: true },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Contact },
  { href: '/dashboard/administrators', label: 'Administrators', icon: Building, isPremium: true }, // Managing other admins
  { href: '/dashboard/roles', label: 'Roles & Permissions', icon: KeyRound, isPremium: true },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Puzzle, isPremium: true },
  { href: '/dashboard/license', label: 'License Management', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings }, // Company/Org settings
  { href: '/dashboard/faq', label: 'FAQ', icon: LifeBuoy },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const adminUser = MOCK_ADMIN_USER; // Use the mock admin user
  const { currentPlan, isLoading: isPlanLoading } = useCurrentPlan();
  const [activePlan, setActivePlan] = useState<PlanId | null>(null);

  useEffect(() => {
    if (!isPlanLoading && currentPlan) {
      setActivePlan(currentPlan);
    }
  }, [currentPlan, isPlanLoading]);

  const handleLogout = () => {
    console.log("Logout clicked, redirecting to /login");
    // Add actual logout logic here (e.g., clear tokens, call API)
    // For now, just redirect
    router.push('/login');
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar className="border-r border-sidebar-border" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center no-underline hover:opacity-90">
                <LinkIcon className="h-7 w-7 text-primary" />
                <span className="ml-2 text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">{adminUser.organizationName}</span>
              </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {sidebarNavItems.map((item) => {
                const isPremiumLocked = activePlan === 'free' && item.isPremium;
                const tooltipText = isPremiumLocked ? `Upgrade to unlock ${item.label}` : item.label;
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={isPremiumLocked ? "/dashboard/license" : item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        tooltip={{
                          children: tooltipText,
                          side: "right",
                          align: "center",
                          isLockedFeatureTooltip: isPremiumLocked
                        }}
                        isActive={!isPremiumLocked && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))}
                        disabled={isPremiumLocked}
                        className={isPremiumLocked ? 'opacity-60 cursor-not-allowed hover:bg-transparent hover:text-sidebar-foreground' : ''}
                        onClick={isPremiumLocked ? (e) => {
                            e.preventDefault();
                            router.push('/dashboard/license'); // Or /subscription
                        } : undefined}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden flex items-center justify-between w-full">
                          {item.label}
                          {isPremiumLocked && <Lock className="h-3 w-3 ml-auto text-amber-500" />}
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="p-3">
            <Link href="/dashboard/settings" className="block hover:bg-sidebar-accent/50 p-2 rounded-md -m-2 transition-colors">
              <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} data-ai-hint="person avatar"/>
                  <AvatarFallback>{adminUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium">{adminUser.name}</p>
                  <p className="text-xs text-muted-foreground">{adminUser.organizationName}</p>
                </div>
              </div>
            </Link>
            <Button variant="ghost" className="w-full justify-start mt-2 group-data-[collapsible=icon]:px-2" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4 shadow-sm">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold ml-2">
                    {sidebarNavItems.find(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
                </h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
