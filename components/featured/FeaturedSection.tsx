"use client";

import FeaturedHeader from './FeaturedHeader';
import FeaturedCarousel from './FeaturedCarousel';

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

interface FeaturedSectionProps {
  title: string;
  items: Prompt[];
  contentType: string;
  viewAllLink: string;
}

export default function FeaturedSection({
  title,
  items,
  contentType,
  viewAllLink,
}: FeaturedSectionProps) {
  return (
    <section className="w-full py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedHeader title={title} viewAllLink={viewAllLink} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedCarousel items={items} contentType={contentType} />
      </div>
    </section>
  );
}
