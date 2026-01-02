# API Query Examples - Result Output Type Feature

## Complete SQL Queries for Reference

### 1. Get All Prompts by Output Type
```sql
-- Get all image output prompts
SELECT 
  id,
  title,
  slug,
  content_type,
  result_output_type,
  created_at,
  is_premium,
  price
FROM prompts
WHERE result_output_type = 'image'
  AND status = 'approved'
ORDER BY created_at DESC
LIMIT 20;

-- Get all code output prompts
SELECT * FROM prompts
WHERE result_output_type = 'code'
  AND status = 'approved'
ORDER BY created_at DESC;

-- Get all video output prompts
SELECT * FROM prompts
WHERE result_output_type = 'video'
  AND status = 'approved'
ORDER BY created_at DESC;
```

### 2. Statistics Query
```sql
-- Get count of prompts by output type
SELECT 
  result_output_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_premium THEN 1 END) as premium_count,
  COUNT(CASE WHEN is_premium = false THEN 1 END) as free_count
FROM prompts
WHERE status = 'approved'
GROUP BY result_output_type
ORDER BY total_count DESC;

-- Output:
-- result_output_type | total_count | premium_count | free_count
-- image              | 450         | 120           | 330
-- code               | 180         | 45            | 135
-- video              | 90          | 30            | 60
-- text               | 75          | 15            | 60
-- design             | 45          | 20            | 25
-- other              | 20          | 5             | 15
```

### 3. User's Prompts with Output Type
```sql
-- Get current user's prompts with output type
SELECT 
  id,
  slug,
  title,
  content_type,
  result_output_type,
  status,
  is_premium,
  created_at,
  (SELECT COUNT(*) FROM purchases WHERE prompt_id = prompts.id AND status = 'completed') as purchase_count
FROM prompts
WHERE created_by = 'user-id-here'
ORDER BY created_at DESC;
```

### 4. Filter by Multiple Criteria
```sql
-- Get prompts: 
-- - Content Type: Prompt (not video tutorial)
-- - Output Type: Image or Code
-- - Status: Approved
-- - Not Premium
SELECT 
  id,
  title,
  slug,
  content_type,
  result_output_type,
  model,
  price
FROM prompts
WHERE content_type = 'prompt'
  AND result_output_type IN ('image', 'code')
  AND status = 'approved'
  AND is_premium = false
ORDER BY created_at DESC
LIMIT 24;
```

### 5. Join with Reviews
```sql
-- Get prompts with ratings, grouped by output type
SELECT 
  p.result_output_type,
  p.title,
  p.slug,
  COUNT(r.id) as review_count,
  AVG(r.rating) as avg_rating
FROM prompts p
LEFT JOIN reviews r ON p.id = r.prompt_id
WHERE p.status = 'approved'
  AND p.result_output_type = 'image'
GROUP BY p.id, p.title, p.slug, p.result_output_type
ORDER BY avg_rating DESC
LIMIT 10;
```

---

## TypeScript API Route Examples

### 1. API Route to Get Prompts by Output Type
```typescript
// File: /app/api/prompts/by-output-type/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const outputType = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '24');
    const page = parseInt(url.searchParams.get('page') || '1');

    if (!outputType) {
      return NextResponse.json({ error: 'Output type required' }, { status: 400 });
    }

    const validTypes = ['image', 'text', 'video', 'code', 'design', 'other'];
    if (!validTypes.includes(outputType)) {
      return NextResponse.json({ error: 'Invalid output type' }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    const { data, error } = await supabaseAdmin
      .from('prompts')
      .select('id,slug,title,description,result_output_type,model,result_urls,is_premium,price,trusted')
      .eq('result_output_type', outputType)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      output_type: outputType,
      count: data?.length || 0,
      results: data || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
```

### 2. Updated Search API with Output Type Filter
```typescript
// File: /app/api/search/route.ts - ADD THIS SECTION

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const outputType = url.searchParams.get('outputType');  // NEW
    const tag = url.searchParams.get('tag') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(url.searchParams.get('limit') || '24', 10) || 24;
    const offset = (page - 1) * limit;
    const contentType = url.searchParams.get('contentType');

    let query = supabaseAdmin
      .from('prompts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`);
    }
    
    // NEW: Filter by output type
    if (outputType) {
      query = query.eq('result_output_type', outputType);
    }
    
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    if (contentType && contentType !== 'all') {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, results: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}
```

### 3. API Route: Get Output Type Stats
```typescript
// File: /app/api/prompts/output-type-stats/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    // Get count by output type
    const { data, error } = await supabaseAdmin.rpc('get_output_type_stats');
    
    if (error) {
      // Fallback if RPC doesn't exist
      const { data: prompts } = await supabaseAdmin
        .from('prompts')
        .select('result_output_type')
        .eq('status', 'approved');

      const stats = {
        image: prompts?.filter(p => p.result_output_type === 'image').length || 0,
        text: prompts?.filter(p => p.result_output_type === 'text').length || 0,
        video: prompts?.filter(p => p.result_output_type === 'video').length || 0,
        code: prompts?.filter(p => p.result_output_type === 'code').length || 0,
        design: prompts?.filter(p => p.result_output_type === 'design').length || 0,
        other: prompts?.filter(p => p.result_output_type === 'other').length || 0
      };

      return NextResponse.json({ ok: true, stats });
    }

    return NextResponse.json({ ok: true, stats: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
```

---

## Frontend Query Examples

### 1. Fetch Prompts by Output Type
```typescript
// In a React component

async function fetchImagePrompts() {
  const res = await fetch('/api/prompts/by-output-type?type=image&limit=24&page=1');
  const data = await res.json();
  return data.results;
}

async function fetchCodePrompts() {
  const res = await fetch('/api/prompts/by-output-type?type=code&limit=24&page=1');
  const data = await res.json();
  return data.results;
}
```

### 2. Search with Output Type Filter
```typescript
async function searchWithFilter(query: string, outputType: string) {
  const params = new URLSearchParams();
  params.set('q', query);
  if (outputType) params.set('outputType', outputType);
  
  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();
  return data.results;
}

// Usage:
const results = await searchWithFilter('portrait', 'image');
const codeSnippets = await searchWithFilter('react', 'code');
```

### 3. Component with Output Type Filter
```tsx
"use client";

import { useState, useEffect } from 'react';

export default function OutputTypeFilter() {
  const [selectedType, setSelectedType] = useState('image');
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      const res = await fetch(`/api/prompts/by-output-type?type=${selectedType}&limit=24`);
      const data = await res.json();
      setPrompts(data.results);
    };
    fetchPrompts();
  }, [selectedType]);

  return (
    <div>
      <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
        <option value="image">Images</option>
        <option value="text">Text</option>
        <option value="video">Videos</option>
        <option value="code">Code</option>
        <option value="design">Design Files</option>
        <option value="other">Other</option>
      </select>

      <div className="grid grid-cols-3 gap-4">
        {prompts.map(p => (
          <div key={p.id} className="p-4 border rounded">
            <h3>{p.title}</h3>
            <span className="text-sm text-gray-500">
              Output: {p.result_output_type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Migration Script (for reference)

Run this in Supabase SQL Editor:

```sql
-- Step 1: Add column
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS result_output_type text DEFAULT 'image';

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_prompts_result_output_type 
ON prompts(result_output_type);

-- Step 3: Add constraint
ALTER TABLE prompts 
ADD CONSTRAINT valid_result_output_type 
CHECK (result_output_type IN ('image', 'text', 'video', 'code', 'design', 'other'));

-- Step 4: Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'prompts' 
  AND column_name = 'result_output_type';

-- Should show:
-- column_name       | data_type | column_default
-- result_output_type| text      | 'image'::text
```
