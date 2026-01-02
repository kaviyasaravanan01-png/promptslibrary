"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import HeroSection from '../components/hero/HeroSection';
import FeatureCarousel from '../components/feature-carousel/FeatureCarousel';
import FeaturedSection from '../components/featured/FeaturedSection';
import PromptGridWithFilter from '../components/PromptGridWithFilter';
import MarketplaceFilters from '../components/MarketplaceFilters';
import PopularTags from '../components/PopularTags';

export default function Home() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([]);
  const [featuredVideoTutorials, setFeaturedVideoTutorials] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      let query = supabase
        .from('prompts')
        .select('id,slug,title,description,model,result_urls,is_premium,price,requirements,instructions,trusted,content_type,result_output_type,is_featured,category_id,subcategory_id,subsub_id,tags')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(24);
      if (filters.contentType && filters.contentType !== 'all') query = query.eq('content_type', filters.contentType);
      if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters.subcategoryId) query = query.eq('subcategory_id', filters.subcategoryId);
      if (filters.subsubId) query = query.eq('subsub_id', filters.subsubId);
      if (filters.resultOutputType) query = query.eq('result_output_type', filters.resultOutputType);
      if (filters.isFeatured) query = query.eq('is_featured', true);
      const { data } = await query;
      setPrompts(data || []);
      setLoading(false);
    };
    fetchPrompts();
  }, [filters]);

  // Fetch featured prompts
  useEffect(() => {
    const fetchFeaturedPrompts = async () => {
      const { data } = await supabase
        .from('prompts')
        .select('id,slug,title,description,model,result_urls,is_premium,price,content_type,tags')
        .eq('status', 'approved')
        .eq('content_type', 'prompt')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(7);
      setFeaturedPrompts(data || []);
    };
    fetchFeaturedPrompts();
  }, []);

  // Fetch featured video tutorials
  useEffect(() => {
    const fetchFeaturedVideoTutorials = async () => {
      const { data } = await supabase
        .from('prompts')
        .select('id,slug,title,description,model,result_urls,is_premium,price,content_type,tags')
        .eq('status', 'approved')
        .eq('content_type', 'video_tutorial')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(7);
      setFeaturedVideoTutorials(data || []);
    };
    fetchFeaturedVideoTutorials();
  }, []);

  const handleHeroSearch = (query: string) => {
    router.push(`/marketplace?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <HeroSection onSearch={handleHeroSearch} />

      {/* Feature Carousel */}
      <FeatureCarousel />

      {/* Featured Prompts */}
      <FeaturedSection
        title="Featured Prompts"
        items={featuredPrompts}
        contentType="prompt"
        viewAllLink="/marketplace?is_featured=true&contentType=prompt"
      />

      {/* Featured Video Tutorials */}
      <FeaturedSection
        title="Featured Video Tutorials"
        items={featuredVideoTutorials}
        contentType="video_tutorial"
        viewAllLink="/marketplace?is_featured=true&contentType=video_tutorial"
      />

      {/* Popular Tags */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 mb-12">
        <PopularTags />
      </div>

      {/* Trending Prompts Section */}
      <section className="max-w-6xl mx-auto px-6 md:px-8" aria-label="Trending prompts">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Trending Prompts
          </h2>
          <p className="text-gray-400">
            Most loved prompts from our community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <MarketplaceFilters onChange={setFilters} />
          </div>
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {loading ? 'Loading...' : `${prompts.length} results`}
              </div>
            </div>
            <PromptGridWithFilter prompts={prompts} />
          </div>
        </div>
      </section>
    </div>
  );
}
