"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import HeroSection from '../components/hero/HeroSection';
import FeatureCarousel from '../components/feature-carousel/FeatureCarousel';
import FeaturedSection from '../components/featured/FeaturedSection';
import TrendingSection from '../components/trending/TrendingSection';
import OutputTypeSection from '../components/output-type/OutputTypeSection';
import ExploreMarketplaceCTA from '../components/cta/ExploreMarketplaceCTA';
import PromptGridWithFilter from '../components/PromptGridWithFilter';
import MarketplaceFilters from '../components/MarketplaceFilters';
import PopularTags from '../components/PopularTags';

export default function Home() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([]);
  const [featuredVideoTutorials, setFeaturedVideoTutorials] = useState<any[]>([]);
  const [trendingPrompts, setTrendingPrompts] = useState<any[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [outputTypeData, setOutputTypeData] = useState<Record<string, any[]>>({});
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

  // Fetch trending content
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [promptRes, videoRes] = await Promise.all([
          fetch('/api/trending?contentType=prompt&limit=15', { cache: 'no-store' }),
          fetch('/api/trending?contentType=video_tutorial&limit=15', { cache: 'no-store' })
        ]);
        const promptJson = await promptRes.json();
        const videoJson = await videoRes.json();
        setTrendingPrompts(promptJson.items || []);
        setTrendingVideos(videoJson.items || []);
      } catch (err) {
        console.error('trending fetch error', err);
      }
    };
    fetchTrending();
  }, []);

  // Fetch output-type sections (image, video, code)
  useEffect(() => {
    const sections = [
      { key: 'image', expectedOutputType: 'image' },
      { key: 'video', expectedOutputType: 'video' },
      { key: 'code', expectedOutputType: 'code' },
    ];

    const fetchAll = async () => {
      try {
        const results = await Promise.all(sections.map(async (section) => {
          const { data } = await supabase
            .from('prompts')
            .select('id,slug,title,description,model,result_urls,is_premium,price,content_type,tags')
            .eq('status', 'approved')
            .eq('result_output_type', section.expectedOutputType)
            .order('created_at', { ascending: false })
            .limit(8);
          return { key: section.key, data: data || [] };
        }));

        const mapped: Record<string, any[]> = {};
        results.forEach((r) => { mapped[r.key] = r.data; });
        setOutputTypeData(mapped);
      } catch (err) {
        console.error('output type fetch error', err);
      }
    };

    fetchAll();
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

      {/* Trending Sections */}
      <TrendingSection
        title="Trending Prompts"
        items={trendingPrompts}
      />

      <TrendingSection
        title="Trending Video Tutorials"
        items={trendingVideos}
      />

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

      {/* Output Type Discovery */}
      <OutputTypeSection
        title="Photo Prompts"
        items={outputTypeData.image || []}
        viewAllLink="/marketplace?expectedOutput=image"
        contentType="prompt"
      />
      <OutputTypeSection
        title="Video Prompts"
        items={outputTypeData.video || []}
        viewAllLink="/marketplace?expectedOutput=video"
        contentType="video_tutorial"
      />
      <OutputTypeSection
        title="Code Prompts"
        items={outputTypeData.code || []}
        viewAllLink="/marketplace?expectedOutput=code"
        contentType="prompt"
      />

      {/* CTA Banner */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <ExploreMarketplaceCTA />
      </div>

      {/* Popular Tags */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 mb-12">
        <PopularTags />
      </div>

      {/* Browse Prompts Section */}
      <section className="max-w-6xl mx-auto px-6 md:px-8" aria-label="Browse prompts">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Browse Prompts
          </h2>
          <p className="text-gray-400">
            Filter and explore the latest approved prompts
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
