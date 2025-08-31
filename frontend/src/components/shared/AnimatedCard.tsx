import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  // Use 'any' to avoid strict Target/Variant types mismatch from framer-motion
  initial?: any;
  animate?: any;
  transition?: any;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.5 },
}) => (
  <motion.div
    className={`rounded-xl shadow-md bg-white/80 dark:bg-black/40 p-4 ${className}`}
    initial={initial}
    animate={animate}
    transition={transition}
  >
    {children}
  </motion.div>
);
