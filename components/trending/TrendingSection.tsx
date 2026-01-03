"use client";

import { useEffect, useMemo, useState } from 'react';
import TrendingGrid from './TrendingGrid';
import { TrendingItem } from './TrendingCard';

interface TrendingSectionProps {
  title: string;
  items: TrendingItem[];
}

export default function TrendingSection({ title, items }: TrendingSectionProps) {
  const [limit, setLimit] = useState<number>(15);

  useEffect(() => {
    const computeLimit = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w < 640) {
        setLimit(6);
      } else if (w < 1024) {
        setLimit(10);
      } else {
        setLimit(15);
      }
    };
    computeLimit();
    window.addEventListener('resize', computeLimit);
    return () => window.removeEventListener('resize', computeLimit);
  }, []);

  const limitedItems = useMemo(() => (items || []).slice(0, limit), [items, limit]);

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h2>
        <TrendingGrid items={limitedItems} />
      </div>
    </section>
  );
}
