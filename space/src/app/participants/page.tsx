"use client";

import React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Users, Award, Timer, Target, Twitter, Linkedin, Globe, ChevronRight, ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { StarIcon } from "@/components/StarIcon";
import { Space3D } from "@/components/Space3D";
import { TextReveal } from "@/components/ui/TextReveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { PerspectiveCard } from "@/components/ui/PerspectiveCard";
import Balancer from "react-wrap-balancer";

const participants = [
  {
    name: "Dr. Sarah Chen",
    role: "Lead Astrophysicist",
    missions: 12,
    hours: "2,400h",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
    bio: "Pioneer in exoplanet atmospheric analysis and deep space navigation. Her research has been fundamental to our understanding of habitable zones."
  },
  {
    name: "Marcus Vane",
    role: "Senior Commander",
    missions: 8,
    hours: "4,800h",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    bio: "Former air force pilot with over two decades of flight experience. Marcus leads all tactical operations for deep space missions."
  },
  {
    name: "Elena Rodriguez",
    role: "Biomedical Engineer",
    missions: 4,
    hours: "950h",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
    bio: "Expert in long-term human physiological adaptation to zero gravity. Currently developing the next generation of life support bio-sensors."
  },
  {
    name: "James Wilson",
    role: "Systems Specialist",
    missions: 15,
    hours: "3,200h",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
    bio: "Responsible for the maintenance of critical life support systems. James has successfully managed over 50 emergency system repairs in-orbit."
  }
];

export default function ParticipantsPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white selection:bg-red-600/30 overflow-x-hidden relative">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-red-600 origin-left z-[110]"
        style={{ scaleX }}
      />
      <Space3D />
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-64 pb-32 px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-4 text-red-500 font-bold tracking-[0.4em] uppercase text-[10px]"
            >
              <span className="w-12 h-px bg-red-500" />
              Humanity's Finest
            </motion.div>
            
            <div className="relative">
              <h1 className="text-[12vw] md:text-[10rem] font-light leading-[0.8] tracking-tighter uppercase mb-4">
                <TextReveal text="The Elite" className="inline-block" /> <br />
                <motion.span 
                  initial={{ opacity: 0, skewX: 20 }}
                  animate={{ opacity: 1, skewX: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-white/20 italic font-thin block md:inline"
                >
                  Architects
                </motion.span> <br />
                <span className="relative">
                  <TextReveal text="Of Space" className="inline-block" />
                  <motion.span 
                    className="absolute -right-[1.5em] top-1/2 w-3 h-3 bg-red-600 rounded-full hidden md:block"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-end mt-12">
              <div className="space-y-8">
                <p className="text-white/50 text-xl md:text-3xl leading-tight font-light max-w-2xl">
                  <Balancer>
                    We select only the visionaries. The dreamers who dare to navigate the silent void and expand the reach of our civilization.
                  </Balancer>
                </p>
                <Magnetic strength={0.2}>
                  <button className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] group">
                    <span className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black group-hover:border-white">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                    View Requirements
                  </button>
                </Magnetic>
              </div>
              
              <div className="grid grid-cols-2 gap-12 text-[10px] text-white/30 tracking-[0.3em] uppercase border-t border-white/5 pt-12">
                <div className="space-y-4">
                  <span className="block text-white/10">Active Personnel</span>
                  <span className="text-white text-3xl font-light tracking-tighter lowercase">142<span className="text-xs text-red-600 ml-1 uppercase">units</span></span>
                </div>
                <div className="space-y-4">
                  <span className="block text-white/10">Launch Windows</span>
                  <span className="text-white text-3xl font-light tracking-tighter lowercase">03<span className="text-xs text-red-600 ml-1 uppercase">slots</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Grid */}
      <section className="py-48 px-8 z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {participants.map((person, i) => (
            <PerspectiveCard key={i} className="h-full">
              <div className="group relative overflow-hidden rounded-[3rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl p-10 transition-all duration-1000 hover:bg-white/[0.03] hover:border-red-500/20 h-full flex flex-col">
                <div className="flex flex-col md:flex-row gap-12 flex-1">
                  <div className="relative w-full md:w-64 h-80 rounded-[2rem] overflow-hidden shrink-0">
                    <Image 
                      src={person.img} 
                      alt={person.name} 
                      fill 
                      className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                      <div className="flex gap-2">
                        <Magnetic strength={0.5}>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl hover:bg-white hover:text-black transition-colors">
                            <Twitter className="w-4 h-4" />
                          </div>
                        </Magnetic>
                        <Magnetic strength={0.5}>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl hover:bg-white hover:text-black transition-colors">
                            <Linkedin className="w-4 h-4" />
                          </div>
                        </Magnetic>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between py-2">
                    <div className="space-y-8">
                      <div>
                        <motion.h3 className="text-4xl font-light tracking-tight group-hover:text-red-500 transition-colors duration-700">{person.name}</motion.h3>
                        <div className="flex items-center gap-3 mt-4">
                          <span className="w-8 h-px bg-red-600/50" />
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">{person.role}</p>
                        </div>
                      </div>
                      <p className="text-white/50 text-base leading-relaxed font-light">
                        {person.bio}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/5 mt-auto">
                      <div className="space-y-2">
                        <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">Missions</span>
                        <p className="text-3xl font-light tracking-tighter">{person.missions < 10 ? `0${person.missions}` : person.missions}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">Flight Hours</span>
                        <p className="text-3xl font-light tracking-tighter">{person.hours}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-100 group-hover:text-red-600 transition-all duration-1000">
                  <StarIcon className="w-6 h-6 rotate-45" />
                </div>
              </div>
            </PerspectiveCard>
          ))}
        </div>
      </section>

      {/* Stats - High Performance Grid */}
      <section className="py-64 px-8 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[1000px] h-[1000px] bg-red-600/5 blur-[200px] rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-[4rem] overflow-hidden backdrop-blur-sm">
            {[
              { label: "Personnel", value: "142", sub: "Global Experts", suffix: "+" },
              { label: "Success", value: "100", sub: "Mission Safety", suffix: "%" },
              { label: "Experience", value: "840", sub: "Total Hours", suffix: "k" },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="group bg-[#0E0E0E]/80 p-24 space-y-16 hover:bg-white/[0.02] transition-colors duration-1000"
              >
                <div className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-8xl font-light tracking-tighter italic group-hover:text-red-500 transition-colors duration-1000">{stat.value}</span>
                    <span className="text-2xl font-light text-red-600">{stat.suffix}</span>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div>
                  <p className="text-[10px] text-white uppercase tracking-[0.4em] font-bold mb-2">{stat.label}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Immersive Portal */}
      <section className="py-96 px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-16"
          >
            <h2 className="text-[10vw] md:text-8xl font-light uppercase tracking-tighter leading-none">
              Become the <br /> 
              <span className="text-white/20 italic">Next Frontier</span>
            </h2>
            <p className="text-white/40 text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
              We don't just explore space. We build the future of humanity among the stars.
            </p>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center pt-8">
              <Magnetic strength={0.3}>
                <button className="group relative px-16 py-8 overflow-hidden rounded-full bg-white text-black font-bold uppercase tracking-[0.3em] text-[10px] transition-all hover:scale-105">
                  <span className="relative z-10">Initiate Application</span>
                  <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                </button>
              </Magnetic>
              
              <Magnetic strength={0.3}>
                <button className="flex items-center gap-6 px-12 py-8 rounded-full border border-white/10 hover:bg-white/5 transition-all uppercase tracking-[0.3em] text-[10px] font-bold group">
                  <Globe className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
                  Global Access
                </button>
              </Magnetic>
            </div>
          </motion.div>
        </div>

        {/* Cinematic Backdrop Elements */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border border-white/[0.02] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border border-white/[0.03] rounded-full pointer-events-none" />
      </section>

      {/* Footer Branding */}
      <footer className="py-32 px-12 border-t border-white/5 relative z-10 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
            <div className="col-span-1 md:col-span-2 space-y-12">
              <div className="flex items-center gap-4">
                <StarIcon className="w-10 h-10" />
                <span className="text-3xl font-bold tracking-tighter uppercase">Space</span>
              </div>
              <p className="text-white/30 text-lg max-w-sm font-light">
                Redefining the boundaries of human potential through next-generation space exploration.
              </p>
            </div>
            <div className="space-y-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Navigation</span>
              <ul className="space-y-4 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                <li><a href="/participants" className="hover:text-red-500 transition-colors">Participants</a></li>
                <li><a href="/trips" className="hover:text-red-500 transition-colors">Trips</a></li>
                <li><a href="/education" className="hover:text-red-500 transition-colors">Education</a></li>
              </ul>
            </div>
            <div className="space-y-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Socials</span>
              <ul className="space-y-4 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                <li><a href="#" className="hover:text-red-500 transition-colors">Twitter / X</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5 text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
            <div>© 2025 Space Exploration Initiative</div>
            <div className="flex gap-12">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
