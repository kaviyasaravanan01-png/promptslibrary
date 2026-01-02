"use client";

import Link from 'next/link';
import { useCallback } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  bgGradient?: string;
  icon?: string;
}

export default function FeatureCard({
  title,
  description,
  href,
  bgGradient = 'from-purple-900/40 via-pink-900/30 to-transparent',
  icon = '✨',
}: FeatureCardProps) {
  // Preload the link when card is focused
  const handleMouseEnter = useCallback(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
  }, [href]);

  return (
    <Link
      href={href}
      className="group relative flex-shrink-0 w-80 h-64 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      onMouseEnter={handleMouseEnter}
      aria-label={`${title}: ${description}`}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />

      {/* Blurred background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.5),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(244,114,182,0.5),transparent_50%)]" />
      </div>

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-pink-500/30 transition-colors duration-300" />

      {/* Content container */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 py-8 text-center">
        {/* Icon */}
        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-pink-200 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
          {description}
        </p>

        {/* CTA Arrow - hidden by default, visible on hover */}
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-pink-400 group-hover:text-pink-300 transition-all duration-300 opacity-0 group-hover:opacity-100">
          Explore
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-t from-pink-500/10 via-transparent to-transparent" />
    </Link>
  );
}
