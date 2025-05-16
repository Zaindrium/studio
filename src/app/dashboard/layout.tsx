
"use client"; // For client-side hooks and context potentially used by Sidebar

import React, { useState } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Link as LinkIcon, LayoutDashboard, Users, CreditCard, FileText, Settings, LifeBuoy, LogOut, Building, Contact, FolderArchive, UserCog, KeyRound, Blocks, Puzzle, ShoppingCart } from 'lucide-react';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarInset,
} from "@/components/ui/sidebar"; // Assuming a sidebar component exists or will be created
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link'; // Next.js Link for navigation


// Simulated user data - replace with actual auth context later
const MOCK_USER = {
  name: "Admin User",
  email: "admin@example.com",
  avatarUrl: "https://placehold.co/40x40.png",
  organizationName: "LinkUP Corp"
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// export const metadata: Metadata = { // Metadata needs to be handled differently for client components
//   title: 'LinkUP Business Dashboard',
//   description: 'Manage your LinkUP business account.',
// };

const sidebarNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/teams', label: 'Teams', icon: Users },
  { href: '/dashboard/users', label: 'Users', icon: UserCog },
  { href: '/dashboard/business-cards', label: 'Business Cards', icon: CreditCard },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/generator', label: 'Generator', icon: Blocks },
  { href: '/dashboard/physical-cards', label: 'Physical Cards', icon: ShoppingCart },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Contact },
  { href: '/dashboard/files', label: 'Files', icon: FolderArchive },
  { href: '/dashboard/administrators', label: 'Administrators', icon: Building },
  { href: '/dashboard/roles', label: 'Roles & Permissions', icon: KeyRound },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/dashboard/license', label: 'License Management', icon: CreditCard }, // Re-using icon
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/faq', label: 'FAQ', icon: LifeBuoy },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // In a real app, you'd get user data from an auth context
  const user = MOCK_USER;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <title>LinkUP Business Dashboard</title>
        <meta name="description" content="Manage your LinkUP business account." />
      </head>
      <body className="bg-background text-foreground">
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen">
            <Sidebar className="border-r border-sidebar-border" collapsible="icon">
              <SidebarHeader className="p-4 flex items-center space-x-3">
                 <Link href="/" className="flex items-center">
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
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
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
                    <SidebarTrigger className="md:hidden" /> {/* For mobile */}
                    <h1 className="text-xl font-semibold ml-2">
                        {sidebarNavItems.find(item => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
                    </h1>
                    {/* Add other header elements like notifications or user menu here if needed */}
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
