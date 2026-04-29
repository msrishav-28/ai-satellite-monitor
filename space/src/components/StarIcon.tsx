"use client";

import { Star } from "lucide-react";

export const StarIcon = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 blur-sm bg-white/30 rounded-full" />
    <Star className="w-8 h-8 fill-white text-white" strokeWidth={1} />
  </div>
);
