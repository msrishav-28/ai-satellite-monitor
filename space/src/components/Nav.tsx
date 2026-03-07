"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Menu, X } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Monitor", href: "/monitor" },
  { name: "Analysis", href: "/analysis" },
  { name: "Participants", href: "/participants" },
  { name: "Trips", href: "/trips" },
];

export const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ${isScrolled ? "py-4 px-8" : "py-10 px-12"
        }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-1000 ${isScrolled ? "bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full py-3 px-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]" : ""
          }`}
      >
        <Magnetic strength={0.2}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-full h-full rounded-full bg-red-600 flex items-center justify-center transition-transform duration-700 group-hover:rotate-180">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">Space</span>
          </Link>
        </Magnetic>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <Magnetic key={link.name} strength={0.3}>
              <Link
                href={link.href}
                className="relative group py-2"
              >
                <span className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${pathname === link.href ? "text-white" : "text-white/40 group-hover:text-white"
                  }`}>
                  {link.name}
                </span>
                <motion.div
                  className={`absolute -bottom-1 left-0 right-0 h-px bg-red-600 origin-left transition-transform duration-500 ${pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                />
              </Link>
            </Magnetic>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Magnetic strength={0.4}>
            <button className="hidden md:flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-500 text-[10px] font-bold uppercase tracking-[0.2em] group">
              <LogIn className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              Portal
            </button>
          </Magnetic>
          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-4 right-4 bg-[#0E0E0E]/95 backdrop-blur-3xl border border-white/10 p-12 rounded-[2rem] md:hidden mt-4"
          >
            <div className="flex flex-col gap-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-4xl font-light uppercase tracking-tighter hover:text-red-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 w-full py-5 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs"
              >
                Portal Access
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

