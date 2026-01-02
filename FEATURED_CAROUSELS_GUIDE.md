# Featured Carousels Implementation Guide

## Overview
This guide documents the implementation of two advanced featured content carousels on the homepage:
1. **Featured Prompts** - Latest 7 prompts with `is_featured=true` and `content_type=prompt`
2. **Featured Video Tutorials** - Latest 7 video tutorials with `is_featured=true` and `content_type=video_tutorial`

## Component Architecture

### 1. FeaturedCard.tsx (`/components/featured/FeaturedCard.tsx`)
Individual card component for displaying prompt/video tutorial details.

**Features:**
- **Image Preview**: Cover-style image with lazy loading and error handling
- **AI Model Badge**: Color-coded badge (top-left) based on AI model
  - Midjourney: Purple (`bg-purple-600`)
  - ChatGPT: Green (`bg-green-600`)
  - Gemini: Blue (`bg-blue-600`)
  - Veo: Orange (`bg-orange-600`)
  - Claude: Amber (`bg-amber-600`)
  - Default: Pink (`bg-pink-600`)
- **Content Type Badge**: Blue video badge for video tutorials (top-right)
- **Title**: 2-line clamp with hover color change
- **Tags**: Display first 2 tags + count indicator
- **Price**: Bold display for premium, green "Free" for free prompts
- **Hover Effects**:
  - Scale to 1.02x
  - Gradient overlay (black/60 from bottom)
  - Arrow icon slides in from right
  - Border changes to pink-500/50

**Props:**
```typescript
interface FeaturedCardProps {
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
```

**Dimensions:** Fixed width of 256px (w-64) for consistent carousel alignment

---

### 2. FeaturedHeader.tsx (`/components/featured/FeaturedHeader.tsx`)
Section header with title and "View All" link.

**Features:**
- **Responsive Title**: 2xl on mobile, 3xl on desktop
- **View All Link**: 
  - Pink-400 color with hover transition
  - Right arrow icon with slide animation
  - Focus-visible ring for accessibility

**Props:**
```typescript
interface FeaturedHeaderProps {
  title: string;
  viewAllLink: string;
}
```

---

### 3. FeaturedCarousel.tsx (`/components/featured/FeaturedCarousel.tsx`)
Horizontal scrolling carousel with navigation controls.

**Features:**
- **Scroll Management**:
  - `useRef` for container reference
  - `scrollBy` for smooth animation (no external libraries)
  - Scroll amount: 280px (card width 256px + gap 24px)
- **Navigation Buttons**:
  - Left/Right arrows with disabled states
  - Positioned absolutely outside container
  - Fade out when at edges (opacity-0)
  - Hover effects: pink-600 background
- **Scroll Position Detection**:
  - `checkScrollPosition()` updates button states
  - Listens to scroll events
  - 10px threshold for right edge detection
- **Drag/Swipe Support**:
  - Mouse drag on desktop
  - Touch swipe on mobile
  - Manual scroll position calculation
- **Snap Behavior**: CSS snap-x and snap-start for card alignment
- **Empty State**: Displays message when no items available

**Props:**
```typescript
interface FeaturedCarouselProps {
  items: Prompt[];
  contentType: string;
}
```

**Styling:**
- Gap: 24px between cards
- Overflow: hidden with custom scrollbar hide
- Smooth scroll behavior

---

### 4. FeaturedSection.tsx (`/components/featured/FeaturedSection.tsx`)
Main wrapper component combining header and carousel.

**Features:**
- Combines `FeaturedHeader` + `FeaturedCarousel`
- Max-width: 7xl (1280px)
- Responsive padding: 4 (mobile), 6 (sm), 8 (lg)
- Vertical spacing: py-12

**Props:**
```typescript
interface FeaturedSectionProps {
  title: string;
  items: Prompt[];
  contentType: string;
  viewAllLink: string;
}
```

---

## Homepage Integration

### File: `app/page.client.tsx`

**State Management:**
```typescript
const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([]);
const [featuredVideoTutorials, setFeaturedVideoTutorials] = useState<any[]>([]);
```

**Data Fetching:**
```typescript
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
```

**Component Usage:**
```tsx
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
```

**Homepage Layout Order:**
1. HeroSection
2. FeatureCarousel
3. **FeaturedSection (Prompts)** ← NEW
4. **FeaturedSection (Video Tutorials)** ← NEW
5. PopularTags
6. Trending Prompts (with filters)

---

## Marketplace Integration

### File: `app/marketplace/page.tsx`

**URL Parameter Support:**
```typescript
interface Props { 
  searchParams?: { 
    q?: string; 
    tag?: string; 
    contentType?: string; 
    is_featured?: string;  // ← NEW
  } 
}

const isFeatured = searchParams?.is_featured === 'true';
const [filters, setFilters] = useState<any>({ contentType, isFeatured });
```

**API Integration:**
The marketplace already passes `isFeatured` to the search API:
```typescript
if (filters.isFeatured) params.set('isFeatured', 'true');
```

**View All Links:**
- Featured Prompts: `/marketplace?is_featured=true&contentType=prompt`
- Featured Video Tutorials: `/marketplace?is_featured=true&contentType=video_tutorial`

These links will:
1. Load the marketplace page
2. Auto-select "Prompt" or "Video Tutorial" in dropdown
3. Auto-check "Featured Only" checkbox
4. Display only featured items of that content type

---

## Database Requirements

### Required Column
Ensure the `is_featured` column exists in the `prompts` table:
```sql
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON prompts(is_featured);
```

**Migration File:** `sql/migrations/013_add_is_featured.sql`

### Sample Data
To feature prompts/videos, update via admin dashboard or SQL:
```sql
UPDATE prompts SET is_featured = true WHERE id = 'prompt-id-here';
```

---

## Styling & Design

### Color Scheme
- **Primary Accent**: Pink-400/500 for links and hover states
- **Card Background**: White/5 with white/10 border
- **Text**: White (titles), Gray-300 (tags), Gray-400 (empty states)
- **Badges**: Model-specific colors (purple, green, blue, orange, amber)

### Responsive Breakpoints
- **Mobile**: Full-width cards, single card visible
- **Tablet/Desktop**: Multiple cards visible with partial cards on edges
- **Max Width**: 1280px (7xl) centered with auto margins

### Animations
- **Hover Scale**: 1.02x on cards
- **Arrow Slide**: translateX(1) on hover
- **Scroll**: Smooth behavior with 280px increments
- **Fade**: Opacity transitions for navigation buttons

---

## Accessibility

### Features
- **ARIA Labels**: "Scroll left" and "Scroll right" on buttons
- **Focus Visible**: Pink ring on focusable elements
- **Semantic HTML**: Proper heading hierarchy (h2, h3)
- **Keyboard Navigation**: Tab through cards and buttons
- **Link Context**: Full card is clickable link to detail page

### Screen Reader Support
- Section titles clearly labeled
- Navigation buttons have descriptive labels
- Empty states provide context messages

---

## Performance Optimizations

### Image Loading
- **Lazy Loading**: Next.js Image component with lazy prop
- **Error Handling**: Fallback SVG icon on image load failure
- **Sizes Attribute**: Optimized for 256px card width

### Query Optimization
- **Limited Fields**: Only select needed columns
- **Limit 7**: Fetch exactly what's displayed
- **Separate Queries**: Independent fetching prevents blocking
- **Index Usage**: `is_featured` column indexed for fast filtering

### Rendering
- **Client Component**: Enables interactive carousel features
- **useState**: Manages scroll position and button states
- **useEffect**: Cleanup listeners to prevent memory leaks
- **Memoization**: Consider useMemo for filteredPrompts if needed

---

## Testing Checklist

### Functionality
- [ ] Featured prompts display correctly (7 items max)
- [ ] Featured video tutorials display correctly (7 items max)
- [ ] Left arrow disabled at start position
- [ ] Right arrow disabled at end position
- [ ] Smooth scrolling works on button click
- [ ] Drag/swipe works on mobile and desktop
- [ ] Cards link to correct detail pages
- [ ] View All links navigate with correct filters
- [ ] Empty state displays when no featured items

### Visual
- [ ] Card dimensions consistent (256px width)
- [ ] Images load and display correctly
- [ ] AI model badges show correct colors
- [ ] Video badge appears only on video tutorials
- [ ] Price displays correctly (premium vs free)
- [ ] Tags display first 2 + count
- [ ] Hover effects work smoothly
- [ ] Responsive on mobile, tablet, desktop

### Marketplace Integration
- [ ] `/marketplace?is_featured=true&contentType=prompt` works
- [ ] `/marketplace?is_featured=true&contentType=video_tutorial` works
- [ ] Featured Only checkbox checked on load
- [ ] Content Type dropdown shows correct selection
- [ ] Results filtered correctly

---

## Troubleshooting

### No Items Displaying
1. Check database: `SELECT * FROM prompts WHERE is_featured = true;`
2. Verify migration ran: `013_add_is_featured.sql`
3. Check admin dashboard: Set some prompts to featured
4. Inspect browser console for API errors

### Scroll Buttons Not Working
1. Check `scrollContainerRef.current` exists
2. Verify scroll width > client width
3. Check CSS overflow settings
4. Test scroll position calculation

### Images Not Loading
1. Verify `result_urls` array has valid URLs
2. Check Supabase Storage permissions
3. Inspect browser console for CORS errors
4. Test fallback SVG icon displays

### Filters Not Applied
1. Verify `is_featured` URL param read correctly
2. Check `isFeatured` in filters state
3. Inspect API request parameters
4. Test search API response

---

## Future Enhancements

### Potential Features
- **Auto-Play**: Automatic scrolling every N seconds
- **Progress Indicators**: Dots showing current position
- **Infinite Scroll**: Load more items on scroll end
- **Skeleton Loading**: Placeholders while fetching
- **Animation Variants**: Different transition effects
- **Keyboard Shortcuts**: Arrow keys for navigation
- **Touch Gestures**: Pinch to zoom, double-tap
- **Share Buttons**: Quick share to social media
- **Bookmarking**: Save favorites directly from card

### Performance
- **Virtual Scrolling**: Only render visible cards
- **Image Preloading**: Load next cards in background
- **Cache Strategy**: Store featured items in localStorage
- **Pagination**: Load more than 7 with pagination

---

## Files Created/Modified

### New Files (4 components)
- ✅ `components/featured/FeaturedCard.tsx` (154 lines)
- ✅ `components/featured/FeaturedHeader.tsx` (31 lines)
- ✅ `components/featured/FeaturedCarousel.tsx` (137 lines)
- ✅ `components/featured/FeaturedSection.tsx` (31 lines)

### Modified Files
- ✅ `app/page.client.tsx` - Added imports, state, fetch logic, component usage
- ✅ `app/marketplace/page.tsx` - Added `is_featured` URL param support

### Database Files (Ready)
- ✅ `sql/migrations/013_add_is_featured.sql` - Ready to execute

---

## Quick Reference

### Import Components
```typescript
import FeaturedSection from '../components/featured/FeaturedSection';
```

### Render Carousel
```tsx
<FeaturedSection
  title="Section Title"
  items={dataArray}
  contentType="prompt" // or "video_tutorial"
  viewAllLink="/marketplace?is_featured=true&contentType=prompt"
/>
```

### Query Featured Items
```typescript
const { data } = await supabase
  .from('prompts')
  .select('id,slug,title,description,model,result_urls,is_premium,price,content_type,tags')
  .eq('status', 'approved')
  .eq('content_type', contentType)
  .eq('is_featured', true)
  .order('created_at', { ascending: false })
  .limit(7);
```

---

## Support & Maintenance

### Admin Dashboard
Manage featured status via:
- **URL**: `/admin/review`
- **Feature Button**: Toggle featured status per prompt
- **Bulk Actions**: (Future) Select multiple and feature/unfeature

### Monitoring
- Check featured count: `SELECT COUNT(*) FROM prompts WHERE is_featured = true;`
- Check by type: `...WHERE is_featured = true AND content_type = 'prompt';`
- Recent featured: `...WHERE is_featured = true ORDER BY created_at DESC LIMIT 10;`

---

## Documentation References
- Feature Carousel: `FEATURE_CAROUSEL_IMPLEMENTATION.md`
- Featured Prompts System: `FEATURED_PROMPTS_GUIDE.md`
- Admin Dashboard: `ADMIN_DASHBOARD_GUIDE.md` (if exists)
- Result Output Types: `RESULT_OUTPUT_TYPE_GUIDE.md`

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: ✅ Complete & Production-Ready
