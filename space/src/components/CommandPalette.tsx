'use client'

import { useEffect, useState } from 'react'
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

const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navigation' },
    { name: 'Monitor', href: '/monitor', icon: Globe, group: 'Navigation' },
    { name: 'Analysis', href: '/analysis', icon: Flame, group: 'Navigation' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, group: 'Navigation' },
    { name: 'Alerts', href: '/alerts', icon: Bell, group: 'Navigation' },
    { name: 'Settings', href: '/settings', icon: Settings, group: 'Navigation' },
    { name: 'Home', href: '/', icon: ArrowRight, group: 'Navigation' },
]

const quickActions = [
    { name: 'Search satellite data...', action: 'search-data', icon: Search, group: 'Actions' },
    { name: 'Draw new AOI polygon', action: 'draw-aoi', icon: Globe, group: 'Actions' },
    { name: 'View latest alerts', action: 'view-alerts', icon: Bell, group: 'Actions' },
]

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

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

    const handleSelect = (href: string) => {
        setOpen(false)
        router.push(href)
    }

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
