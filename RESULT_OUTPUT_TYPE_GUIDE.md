# Result Output Type Feature - Implementation Guide

## Overview
This feature allows creators to specify what type of output users will receive when using their prompt:
- **For Prompts**: Image, Text, Video, Code, Design/File, or Other
- **For Video Tutorials**: Automatically defaults to "Video"

---

## 1. DATABASE UPDATES

### Migration File Created
Location: `/sql/migrations/012_add_result_output_type.sql`

### SQL Query to Run in Supabase
Run this in your Supabase SQL editor:

```sql
-- Add result_output_type column to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS result_output_type text DEFAULT 'image';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_result_output_type ON prompts(result_output_type);

-- Add check constraint to ensure valid values
ALTER TABLE prompts ADD CONSTRAINT valid_result_output_type 
  CHECK (result_output_type IN ('image', 'text', 'video', 'code', 'design', 'other'));
```

### Valid Values for result_output_type
- `'image'` - Image output (paintings, designs, renderings, etc.)
- `'text'` - Text output (articles, scripts, transcripts, etc.)
- `'video'` - Video output (edited videos, animations, etc.)
- `'code'` - Code output (functions, scripts, plugins, etc.)
- `'design'` - Design/File output (PSD, Figma files, etc.)
- `'other'` - Other output types

---

## 2. UPDATED DATABASE QUERIES

### Query for /my/prompts page (to display result output type)
```sql
SELECT 
  id, 
  slug, 
  title, 
  description, 
  model, 
  result_urls, 
  is_premium, 
  price, 
  content_type, 
  result_output_type,  -- NEW FIELD
  created_at, 
  status
FROM prompts 
WHERE created_by = auth.uid()
ORDER BY created_at DESC;
```

### Query to filter by result output type
```sql
SELECT *
FROM prompts
WHERE result_output_type = 'image'
  AND status = 'approved'
ORDER BY created_at DESC;
```

### Query to get all prompts with result output type stats
```sql
SELECT 
  result_output_type,
  COUNT(*) as count
FROM prompts
WHERE status = 'approved'
GROUP BY result_output_type
ORDER BY count DESC;
```

---

## 3. FRONTEND CHANGES MADE

### 1. CreatePromptForm.tsx
**Changes:**
- Added `resultOutputType` state with smart default:
  - For "video_tutorial": defaults to "video"
  - For "prompt": defaults to "image"
- Added dropdown selector after content type selection
  - Shows dropdown for prompts
  - Shows read-only "Video (Default)" for video tutorials
- Added help text: "Select what users will receive as output from using this prompt"
- Included `result_output_type` in form payload

**Location:** `/components/CreatePromptForm.tsx` (Lines 10, 164, 180-207)

### 2. Backend API Changes
**File:** `/app/api/prompts/create/route.ts`

**Changes:**
- Extract `result_output_type` from request body
- Auto-set to "video" for video_tutorial content_type
- Default to "image" for prompts if not specified
- Save to database

---

## 4. STORING & RETRIEVING DATA

### How it's Stored
When a user creates a prompt:
1. Selects content type (Prompt or Video Tutorial)
2. If Prompt: Selects expected output type from dropdown
3. If Video Tutorial: Automatically set to "video"
4. Sent to API as: `{ result_output_type: "image"|"text"|"video"|"code"|"design"|"other" }`
5. Stored in `prompts.result_output_type` column

### How to Retrieve in API Routes
Add to your SELECT queries:
```typescript
.select('id,slug,title,result_output_type,content_type,...')
```

### Example in /my/prompts API
```typescript
const { data } = await supabaseAdmin
  .from('prompts')
  .select('id,slug,title,content_type,result_output_type,status')
  .eq('created_by', userId)
  .order('created_at', { ascending: false });
```

---

## 5. DISPLAYING RESULT OUTPUT TYPE

### Option A: Badge on Prompt Card
```tsx
<span className="px-2 py-1 rounded text-xs bg-blue-700">
  {prompt.result_output_type.charAt(0).toUpperCase() + prompt.result_output_type.slice(1)}
</span>
```

### Option B: In Prompt Detail Page
```tsx
<p className="text-sm text-gray-400">
  Expected Output: <span className="text-white font-semibold">{data.result_output_type}</span>
</p>
```

### Option C: Filter by Output Type in Marketplace
```tsx
<select onChange={(e) => setOutputTypeFilter(e.target.value)}>
  <option value="">All Output Types</option>
  <option value="image">Image</option>
  <option value="text">Text</option>
  <option value="video">Video</option>
  <option value="code">Code</option>
  <option value="design">Design / File</option>
  <option value="other">Other</option>
</select>
```

---

## 6. NEXT STEPS FOR COMPLETION

### Frontend Display
- [ ] Update `/app/my/prompts/page.tsx` to show result_output_type in list
- [ ] Add result_output_type to prompt detail page
- [ ] Create filter dropdown in MarketplaceFilters component
- [ ] Update PromptCard to show output type badge

### Backend Updates
- [ ] Update `/api/prompts/[id]` GET route to include result_output_type
- [ ] Update `/api/search/route.ts` to filter by result_output_type
- [ ] Update `/api/prompts/my/route.ts` to include result_output_type

### Database Migration
- [ ] Run migration SQL in Supabase console
- [ ] Verify column created: `SELECT * FROM prompts LIMIT 1;`

---

## 7. TESTING CHECKLIST

- [ ] Create a new prompt with content_type = "prompt" and result_output_type = "image"
- [ ] Create a new prompt with content_type = "prompt" and result_output_type = "code"
- [ ] Create a new video tutorial (result_output_type should auto-set to "video")
- [ ] Query database: `SELECT id, title, content_type, result_output_type FROM prompts;`
- [ ] Verify frontend form displays correct dropdown based on content type
- [ ] Verify backend saves result_output_type correctly
- [ ] Edit existing prompt and verify result_output_type is retained

---

## 8. BACKWARD COMPATIBILITY

Existing prompts will have:
- `result_output_type = 'image'` (default) for prompt content_type
- `result_output_type = 'video'` for video_tutorial content_type

No data loss - all existing functionality preserved.
