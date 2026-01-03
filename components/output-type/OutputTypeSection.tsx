"use client";

import OutputTypeHeader from './OutputTypeHeader';
import OutputTypeCarousel from './OutputTypeCarousel';

interface OutputTypeSectionProps {
  title: string;
  items: any[];
  viewAllLink: string;
  contentType?: string;
}

export default function OutputTypeSection({ title, items, viewAllLink, contentType = 'prompt' }: OutputTypeSectionProps) {
  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OutputTypeHeader title={title} viewAllLink={viewAllLink} />
        <OutputTypeCarousel items={items} contentType={contentType} />
      </div>
    </section>
  );
}
