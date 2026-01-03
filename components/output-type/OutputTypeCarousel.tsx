"use client";

import FeaturedCarousel from '../featured/FeaturedCarousel';
import { memo } from 'react';

interface OutputTypeCarouselProps {
  items: any[];
  contentType?: string;
}

function OutputTypeCarouselBase({ items, contentType }: OutputTypeCarouselProps) {
  return <FeaturedCarousel items={items} contentType={contentType || 'prompt'} />;
}

const OutputTypeCarousel = memo(OutputTypeCarouselBase);
export default OutputTypeCarousel;
