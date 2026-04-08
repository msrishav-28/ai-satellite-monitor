'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Globe,
    LayoutDashboard,
    BarChart3,
    Bell,
    Search,
    Flame,
    Settings,
} from 'lucide-react'
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuBadge,
    SidebarTrigger,
    SidebarInset,
    useSidebar,
} from '@/components/ui/sidebar'
import { Magnetic } from '@/components/ui/Magnetic'
import { CommandPalette, CommandPaletteProvider, useCommandPalette } from '@/components/CommandPalette'

const platformLinks = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Monitor',
        href: '/monitor',
        icon: Globe,
    },
    {
        name: 'Analysis',
        href: '/analysis',
        icon: Flame,
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
    },
    {
        name: 'Alerts',
        href: '/alerts',
        icon: Bell,
        badge: '3',
    },
]

function AppSidebarContent() {
    const pathname = usePathname()
    const { state } = useSidebar()
    const { setOpen: openPalette } = useCommandPalette()
    const isCollapsed = state === 'collapsed'

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-white/5 bg-[#0E0E0E]">
            <SidebarHeader className="p-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                        <div className="relative w-full h-full rounded-full bg-red-600 flex items-center justify-center transition-transform duration-700 group-hover:rotate-180">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-lg font-bold tracking-tighter uppercase"
                        >
                            Space
                        </motion.span>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 px-4">
                        Platform
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {platformLinks.map((link) => (
                                <SidebarMenuItem key={link.name}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === link.href}
                                        tooltip={link.name}
                                        className="h-10 gap-3 px-4 rounded-xl transition-all duration-300 data-[active=true]:bg-white/[0.06] data-[active=true]:text-white hover:bg-white/[0.03]"
                                    >
                                        <Link href={link.href}>
                                            <link.icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                                                {link.name}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {link.badge && (
                                        <SidebarMenuBadge className="bg-red-600 text-white text-[9px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center">
                                            {link.badge}
                                        </SidebarMenuBadge>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {!isCollapsed && (
                    <SidebarGroup className="mt-auto">
                        <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 px-4">
                            Quick Actions
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        className="h-10 gap-3 px-4 rounded-xl hover:bg-white/[0.03] text-white/40"
                                        onClick={() => openPalette(true)}
                                    >
                                        <Search className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                                            Search
                                        </span>
                                        <kbd className="ml-auto text-[9px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                                            ⌘K
                                        </kbd>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Settings"
                            className="h-10 gap-3 px-4 rounded-xl hover:bg-white/[0.03] text-white/40"
                        >
                            <Link href="/settings">
                                <Settings className="w-4 h-4 flex-shrink-0" />
                                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                                    Settings
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

interface AppShellProps {
    children: React.ReactNode
}

function AppShellInner({ children }: AppShellProps) {
    const { setOpen: openPalette } = useCommandPalette()

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebarContent />
            <SidebarInset className="bg-[#0E0E0E]">
                <header className="flex items-center justify-between h-14 px-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="text-white/40 hover:text-white transition-colors" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Magnetic strength={0.2}>
                            <button
                                onClick={() => openPalette(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-white/30 text-[10px] font-medium uppercase tracking-widest hover:bg-white/[0.06] hover:text-white/50 transition-all"
                            >
                                <Search className="w-3 h-3" />
                                Search
                                <kbd className="text-[8px] bg-white/5 px-1 py-0.5 rounded border border-white/10 ml-1">⌘K</kbd>
                            </button>
                        </Magnetic>
                    </div>
                </header>
                {children}
            </SidebarInset>
            <CommandPalette />
        </SidebarProvider>
    )
}

export function AppShell({ children }: AppShellProps) {
    return (
        <CommandPaletteProvider>
            <AppShellInner>{children}</AppShellInner>
        </CommandPaletteProvider>
    )
}
