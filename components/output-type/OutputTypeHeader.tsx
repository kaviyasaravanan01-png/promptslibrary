"use client";

import Link from 'next/link';

interface OutputTypeHeaderProps {
  title: string;
  viewAllLink: string;
}

export default function OutputTypeHeader({ title, viewAllLink }: OutputTypeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      <Link
        href={viewAllLink}
        className="flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded px-3 py-2"
      >
        <span>View all</span>
        <svg
          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}
