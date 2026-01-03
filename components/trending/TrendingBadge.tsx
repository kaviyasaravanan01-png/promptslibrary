"use client";

import { memo } from 'react';

interface TrendingBadgeProps {
  label: string;
  value: string;
  tone?: 'pink' | 'blue' | 'amber' | 'gray';
}

function TrendingBadgeBase({ label, value, tone = 'pink' }: TrendingBadgeProps) {
  const toneClass = {
    pink: 'bg-pink-600/80 text-white border-pink-400/50',
    blue: 'bg-blue-600/80 text-white border-blue-400/50',
    amber: 'bg-amber-600/80 text-white border-amber-300/50',
    gray: 'bg-white/10 text-gray-100 border-white/20',
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded border ${toneClass}`}>
      {label}
      <span className="font-bold">{value}</span>
    </span>
  );
}

const TrendingBadge = memo(TrendingBadgeBase);
export default TrendingBadge;
