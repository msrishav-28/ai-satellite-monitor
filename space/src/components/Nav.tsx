'use client'

/*
  Primary top navigation for landing and full-screen routes.
  Updated in Phase 4 to remove off-domain links and align branding and CTAs
  with the environmental monitoring product.
*/

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Menu, X } from 'lucide-react'
import { Magnetic } from '@/components/ui/Magnetic'

const links = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Monitor', href: '/monitor' },
  { name: 'Analysis', href: '/analysis' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Alerts', href: '/alerts' },
]

export const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ${
        isScrolled ? 'px-8 py-4' : 'px-12 py-10'
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between transition-all duration-1000 ${
          isScrolled
            ? 'rounded-full border border-white/10 bg-white/[0.03] px-8 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-3xl'
            : ''
        }`}
      >
        <Magnetic strength={0.2}>
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-600 opacity-0 blur-md transition-opacity group-hover:opacity-50" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-red-600 transition-transform duration-700 group-hover:rotate-180">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            </div>
            <span className="text-xl font-bold uppercase tracking-tighter">Sentinel</span>
          </Link>
        </Magnetic>

        <div className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Magnetic key={link.name} strength={0.3}>
              <Link href={link.href} className="group relative py-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${
                    pathname === link.href ? 'text-white' : 'text-white/40 group-hover:text-white'
                  }`}
                >
                  {link.name}
                </span>
                <motion.div
                  className={`absolute -bottom-1 left-0 right-0 h-px origin-left bg-red-600 transition-transform duration-500 ${
                    pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            </Magnetic>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Magnetic strength={0.4}>
            <Link
              href="/monitor"
              className="group hidden items-center gap-3 rounded-full border border-white/10 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:bg-white hover:text-black md:flex"
            >
              <Activity className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              Open Monitor
            </Link>
          </Magnetic>
          <button
            className="p-2 text-white/60 hover:text-white md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-4 right-4 mt-4 rounded-[2rem] border border-white/10 bg-[#0E0E0E]/95 p-12 backdrop-blur-3xl md:hidden"
          >
            <div className="flex flex-col gap-8">
              {links.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-4xl font-light uppercase tracking-tighter transition-colors hover:text-red-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/monitor"
                  className="block w-full rounded-full bg-white py-5 text-center text-xs font-bold uppercase tracking-widest text-black"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Open Monitor
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
