'use client'

/*
  Shared application shell for dashboard-style routes.
  Updated in Phase 4 to remove fake alert badges, align branding with the
  environmental monitoring product, and normalize keyboard shortcut labels.
*/

import type { ReactNode } from 'react'
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
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'
import { Magnetic } from '@/components/ui/Magnetic'
import { CommandPalette } from '@/components/CommandPalette'

const platformLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Monitor', href: '/monitor', icon: Globe },
  { name: 'Analysis', href: '/analysis', icon: Flame },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Alerts', href: '/alerts', icon: Bell },
]

function dispatchSearchShortcut() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
}

function AppSidebarContent() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-white/5 bg-[#0E0E0E]">
      <SidebarHeader className="p-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-600 opacity-0 blur-md transition-opacity group-hover:opacity-50" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-red-600 transition-transform duration-700 group-hover:rotate-180">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold uppercase tracking-tighter"
            >
              Sentinel
            </motion.span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">
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
                    className="h-10 gap-3 rounded-xl px-4 transition-all duration-300 data-[active=true]:bg-white/[0.06] data-[active=true]:text-white hover:bg-white/[0.03]"
                  >
                    <Link href={link.href}>
                      <link.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                        {link.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="px-4 text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="h-10 gap-3 rounded-xl px-4 text-white/40 hover:bg-white/[0.03]"
                    onClick={dispatchSearchShortcut}
                  >
                    <Search className="h-4 w-4 flex-shrink-0" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                      Search
                    </span>
                    <kbd className="ml-auto rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-white/20">
                      Ctrl K
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
              className="h-10 gap-3 rounded-xl px-4 text-white/40 hover:bg-white/[0.03]"
            >
              <Link href="/settings">
                <Settings className="h-4 w-4 flex-shrink-0" />
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
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebarContent />
      <SidebarInset className="bg-[#0E0E0E]">
        <header className="flex h-14 items-center justify-between border-b border-white/5 px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-white/40 transition-colors hover:text-white" />
          </div>
          <div className="flex items-center gap-3">
            <Magnetic strength={0.2}>
              <button
                onClick={dispatchSearchShortcut}
                className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white/30 transition-all hover:bg-white/[0.06] hover:text-white/50"
              >
                <Search className="h-3 w-3" />
                Search
                <kbd className="ml-1 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[8px]">Ctrl K</kbd>
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
