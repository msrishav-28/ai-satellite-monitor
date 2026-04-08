'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Globe,
    LayoutDashboard,
    BarChart3,
    Bell,
    Flame,
    Search,
    Settings,
    ArrowRight,
} from 'lucide-react'
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
} from '@/components/ui/command'

// --- Shared State Context ---
interface CommandPaletteContextType {
    open: boolean
    setOpen: (open: boolean) => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
    open: false,
    setOpen: () => {},
})

export function useCommandPalette() {
    return useContext(CommandPaletteContext)
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <CommandPaletteContext.Provider value={{ open, setOpen }}>
            {children}
        </CommandPaletteContext.Provider>
    )
}

// --- Navigation Items ---
const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Monitor', href: '/monitor', icon: Globe },
    { name: 'Analysis', href: '/analysis', icon: Flame },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Home', href: '/', icon: ArrowRight },
]

const quickActions = [
    { name: 'Search satellite data...', action: 'search-data', icon: Search },
    { name: 'Draw new AOI polygon', action: 'draw-aoi', icon: Globe },
    { name: 'View latest alerts', action: 'view-alerts', icon: Bell },
]

// --- Command Palette Dialog ---
export function CommandPalette() {
    const { open, setOpen } = useCommandPalette()
    const router = useRouter()

    const handleSelect = useCallback((href: string) => {
        setOpen(false)
        router.push(href)
    }, [setOpen, router])

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            title="Command Palette"
            description="Navigate or perform actions"
        >
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    {navigationItems.map((item) => (
                        <CommandItem
                            key={item.name}
                            onSelect={() => handleSelect(item.href)}
                            className="gap-3 py-3 cursor-pointer"
                        >
                            <item.icon className="w-4 h-4 text-white/40" />
                            <span className="text-sm">{item.name}</span>
                            <CommandShortcut className="text-[9px] text-white/20">
                                {item.href}
                            </CommandShortcut>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                    {quickActions.map((item) => (
                        <CommandItem
                            key={item.name}
                            onSelect={() => {
                                setOpen(false)
                                if (item.action === 'draw-aoi') router.push('/monitor')
                                if (item.action === 'view-alerts') router.push('/alerts')
                            }}
                            className="gap-3 py-3 cursor-pointer"
                        >
                            <item.icon className="w-4 h-4 text-white/40" />
                            <span className="text-sm">{item.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
