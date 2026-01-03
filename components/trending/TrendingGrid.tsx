"use client";

import { memo } from 'react';
import TrendingCard, { TrendingItem } from './TrendingCard';

interface TrendingGridProps {
  items: TrendingItem[];
}

function TrendingGridBase({ items }: TrendingGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 bg-white/5 border border-white/10 rounded-xl">
        No trending items right now. Check back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
      {items.map((item, idx) => (
        <TrendingCard key={item.id} item={item} index={idx} />
      ))}
    </div>
  );
}

const TrendingGrid = memo(TrendingGridBase);
export default TrendingGrid;
