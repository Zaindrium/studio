"use client";

import React from 'react';
// Fonts are handled by the root layout
import '../globals.css';
// Toaster is handled by the root layout
import { Link as LinkIcon, LayoutDashboard, Users, CreditCard, FileText, Settings, LifeBuoy, LogOut, Building, Contact, UserCog, KeyRound, Blocks, Puzzle, ShoppingCart } from 'lucide-react';
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
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Simulated user data - replace with actual auth context later
const MOCK_USER = {
  name: "Admin User",
  email: "admin@example.com",
  avatarUrl: "https://placehold.co/40x40.png",
  organizationName: "LinkUP Corp"
};

const sidebarNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/teams', label: 'Teams', icon: Users },
  { href: '/dashboard/users', label: 'Users', icon: UserCog },
  { href: '/dashboard/business-cards', label: 'Business Cards', icon: CreditCard },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/generator', label: 'Generator', icon: Blocks },
  { href: '/dashboard/physical-cards', label: 'Physical Cards', icon: ShoppingCart },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Contact },
  // { href: '/dashboard/files', label: 'Files', icon: FolderArchive }, // Removed Files
  { href: '/dashboard/administrators', label: 'Administrators', icon: Building },
  { href: '/dashboard/roles', label: 'Roles & Permissions', icon: KeyRound },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/dashboard/license', label: 'License Management', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/faq', label: 'FAQ', icon: LifeBuoy },
];

// Metadata cannot be exported from a Client Component.
// It should be defined in a Server Component, typically a page.tsx or a parent server layout.tsx.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = MOCK_USER;

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background text-foreground"> {/* Apply bg and text colors here */}
        <Sidebar className="border-r border-sidebar-border" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center space-x-3">
              <Link href="/editor" className="flex items-center">
                <LinkIcon className="h-7 w-7 text-primary" />
                <span className="ml-2 text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">LinkUP</span>
              </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {sidebarNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        tooltip={{children: item.label, side: "right", align: "center"}}
                        isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="p-3">
            <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar"/>
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.organizationName}</p>
              </div>
            </div>
              <Button variant="ghost" className="w-full justify-start mt-2 group-data-[collapsible=icon]:px-2">
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
