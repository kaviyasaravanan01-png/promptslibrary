"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import FeatureCard from './FeatureCard';
import CarouselControls from './CarouselControls';

interface Feature {
  title: string;
  description: string;
  href: string;
  bgGradient?: string;
  icon?: string;
}

interface FeatureCarouselProps {
  features?: Feature[];
}

// Default features configuration
const DEFAULT_FEATURES: Feature[] = [
  {
    title: 'Explore the Marketplace',
    description: 'Browse 240k+ quality, tested prompts',
    href: '/marketplace',
    icon: '🔍',
    bgGradient: 'from-blue-900/40 via-cyan-900/30 to-transparent',
  },
  {
    title: 'Video Tutorial Type',
    description: 'Browse step-by-step AI video tutorials',
    href: '/marketplace?contentType=video_tutorial',
    icon: '🎥',
    bgGradient: 'from-purple-900/40 via-blue-900/30 to-transparent',
  },
  {
    title: 'Prompt Type',
    description: 'Browse ready-to-use AI prompts',
    href: '/marketplace?contentType=prompt',
    icon: '⚡',
    bgGradient: 'from-pink-900/40 via-rose-900/30 to-transparent',
  },
];

export default function FeatureCarousel({ features = DEFAULT_FEATURES }: FeatureCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // Check scroll position and update button states
  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Allow small threshold for floating point errors
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll handler
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 400; // Scroll distance per click
    const targetScroll =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });

    // Check scroll state after animation
    setTimeout(checkScroll, 500);
  }, [checkScroll]);

  // Touch/swipe handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const dragDelta = dragStart - e.clientX;
    scrollContainerRef.current.scrollLeft += dragDelta;
  }, [isDragging, dragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const dragDelta = dragStart - e.touches[0].clientX;
    scrollContainerRef.current.scrollLeft += dragDelta;
  }, [isDragging, dragStart]);

  // Initialize scroll check on mount
  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (!container) return;

    // Listen for scroll events
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  return (
    <section className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Explore Our Features
          </h2>
          <p className="text-gray-400 text-lg">
            Start exploring prompts or share your own expertise
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel */}
          <div
            ref={scrollContainerRef}
            className={`flex gap-6 overflow-x-auto scroll-smooth ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            } [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Padding for partial card visibility */}
            <div className="flex-shrink-0 w-0 md:w-12" />

            {/* Feature Cards */}
            {features.map((feature, index) => (
              <FeatureCard key={`${feature.title}-${index}`} {...feature} />
            ))}

            {/* Padding for partial card visibility */}
            <div className="flex-shrink-0 w-0 md:w-12" />
          </div>

          {/* Carousel Controls - Desktop Only */}
          <div className="hidden md:block mt-6">
            <CarouselControls
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
              onScrollLeft={() => scroll('left')}
              onScrollRight={() => scroll('right')}
            />
          </div>

          {/* Mobile Swipe Hint */}
          <div className="md:hidden mt-4 text-center text-sm text-gray-400">
            Swipe to explore more
          </div>
        </div>
      </div>
    </section>
  );
}
