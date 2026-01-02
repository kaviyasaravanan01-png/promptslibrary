"use client";

import { useRef, useState, useEffect } from 'react';
import FeaturedCard from './FeaturedCard';

interface Prompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  model: string;
  result_urls: Array<{ url: string; type: string }>;
  is_premium: boolean;
  price: number;
  content_type: string;
  tags?: string[];
}

interface FeaturedCarouselProps {
  items: Prompt[];
  contentType: string;
}

export default function FeaturedCarousel({ items, contentType }: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to enable/disable buttons
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Add a slight delay to ensure DOM is fully rendered
      setTimeout(checkScrollPosition, 100);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Calculate how many cards are visible
    const cardWidth = 256; // w-64
    const gap = 24; // gap-6
    const scrollAmount = (cardWidth + gap) * 2; // Scroll 2 cards at a time
    
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  // Handle touch/mouse drag scrolling
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const startX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const scrollLeft = container.scrollLeft;

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].pageX : moveEvent.pageX;
      const diff = startX - currentX;
      container.scrollLeft = scrollLeft + diff;
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No {contentType === 'video_tutorial' ? 'video tutorials' : 'prompts'} available yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
          canScrollLeft
            ? 'opacity-100 hover:bg-pink-600 hover:border-pink-500 cursor-pointer'
            : 'opacity-0 cursor-not-allowed'
        }`}
        aria-label="Scroll left"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className="flex gap-6 overflow-x-scroll scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
        }}
      >
        {items.map((item) => (
          <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
            <FeaturedCard {...item} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
          canScrollRight
            ? 'opacity-100 hover:bg-pink-600 hover:border-pink-500 cursor-pointer'
            : 'opacity-0 cursor-not-allowed'
        }`}
        aria-label="Scroll right"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
