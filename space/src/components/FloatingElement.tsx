"use client";

import React from "react";
import { motion } from "framer-motion";

export const FloatingElement = ({ children, delay = 0, duration = 4, className = "" }: { children: React.ReactNode, delay?: number, duration?: number, className?: string }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [0, -20, 0] }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);
