"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  once?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.01 * i },
  }),
};

const childVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100,
    },
  },
};

export function TextReveal({ text, className, once = true }: TextRevealProps) {
  const words = text.split(" ");

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          variants={childVariants}
          style={{ marginRight: "0.25em" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
