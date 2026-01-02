# Result Output Type Feature - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER WORKFLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Create Prompt Form                                        │
│  ├─ Content Type Selector                                 │
│  │  ├─ "Prompt"           → Show Output Type Dropdown    │
│  │  └─ "Video Tutorial"   → Show Output Type Read-only   │
│  │                                                        │
│  └─ Output Type Selector (Dynamic)                       │
│     ├─ Image (default for prompts)                       │
│     ├─ Text                                              │
│     ├─ Video                                             │
│     ├─ Code                                              │
│     ├─ Design                                            │
│     └─ Other                                             │
│                                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    API REQUEST
┌─────────────────────────────────────────────────────────────┐
│              /api/prompts/create                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Body:                                                  ││
│  │ {                                                      ││
│  │   title: "...",                                        ││
│  │   content_type: "prompt",                              ││
│  │   result_output_type: "image",  ← NEW FIELD           ││
│  │   prompt_text: "...",                                  ││
│  │   result_urls: [...]                                   ││
│  │ }                                                      ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                           ↓
                    DATABASE SAVE
┌─────────────────────────────────────────────────────────────┐
│              PROMPTS TABLE                                  │
│  ┌────────────────────────────────────────────────────────┐│
│  │ id    │ title      │ content_type │ result_output_type││
│  │────────────────────────────────────────────────────────││
│  │ abc-1 │ Anime      │ prompt       │ image             ││
│  │ abc-2 │ Tutorial   │ video_tut    │ video             ││
│  │ abc-3 │ React Tip  │ prompt       │ code              ││
│  │       │            │              │                   ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
CreatePromptForm.tsx
│
├─ State: [resultOutputType, setResultOutputType]
│
├─ useEffect (contentType change)
│  └─ If content_type = 'video_tutorial' → Auto-set to 'video'
│
├─ Form UI
│  ├─ <select> for content_type
│  │  └─ onChange: Update content_type + auto-set outputType if needed
│  │
│  └─ <select> for result_output_type (CONDITIONAL)
│     ├─ If prompt → Show 6 options (image, text, video, code, design, other)
│     └─ If video_tutorial → Show read-only "Video (Default)"
│
└─ On Submit
   ├─ Validate all fields
   ├─ Upload media files
   └─ Send payload WITH result_output_type
      └─ POST /api/prompts/create
         ├─ Backend validates outputType value
         ├─ Sets default if missing: 'image' for prompt, 'video' for video_tutorial
         └─ SAVE to prompts.result_output_type column
```

---

## Data Flow

```
┌─────────────────────────────────────────┐
│    User Interaction (Frontend)          │
│  - Select "Prompt"                      │
│  - Select "Image" output type           │
│  - Fill other form fields               │
│  - Click Submit                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│         CreatePromptForm.tsx Processes                 │
│  ✓ Validate inputs                                     │
│  ✓ Upload files to Supabase Storage                    │
│  ✓ Build payload object:                              │
│    {                                                  │
│      title, content_type, result_output_type,         │
│      prompt_text, result_urls, tags, ...             │
│    }                                                  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│      API Route: /api/prompts/create                    │
│  ✓ Extract result_output_type from body               │
│  ✓ Validate JWT token                                 │
│  ✓ Check permissions                                  │
│  ✓ Auto-set if needed:                               │
│    - video_tutorial → 'video'                         │
│    - prompt → 'image' (default)                       │
│  ✓ Insert into prompts table                          │
│  ✓ Return { ok: true, prompt: {...} }                │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│         Database: Prompts Table                         │
│  INSERT INTO prompts (                                 │
│    id, title, content_type,                            │
│    result_output_type,  ← NEW COLUMN                  │
│    prompt_text, result_urls, ...                       │
│  ) VALUES (...)                                       │
│                                                       │
│  ✓ Row created with:                                 │
│    result_output_type = 'image' (or selected value)  │
└──────────────┬───────────────────────────────────────────┘
               │
               ▼
         ┌────────────────┐
         │ Success! ✓     │
         │ Prompt saved   │
         └────────────────┘
```

---

## Output Type Values & Use Cases

```
┌────────────┬────────────────────────────────────────────────┐
│   Value    │           Use Cases                            │
├────────────┼────────────────────────────────────────────────┤
│ image      │ • AI-generated images (Midjourney, DALL-E)     │
│            │ • Artwork, designs, renders                    │
│            │ • Visual mockups                               │
│            │ (DEFAULT for prompts)                          │
├────────────┼────────────────────────────────────────────────┤
│ text       │ • Blog posts, articles                         │
│            │ • Scripts, transcripts                         │
│            │ • Written creative content                     │
├────────────┼────────────────────────────────────────────────┤
│ video      │ • Animated videos                              │
│            │ • Video tutorials                              │
│            │ • Edited clips                                 │
│            │ (DEFAULT for video_tutorial)                   │
├────────────┼────────────────────────────────────────────────┤
│ code       │ • Code snippets                                │
│            │ • Functions, scripts                           │
│            │ • Plugin templates                             │
├────────────┼────────────────────────────────────────────────┤
│ design     │ • Figma files                                  │
│            │ • PSD, XD, Sketch files                        │
│            │ • UI/UX design assets                          │
├────────────┼────────────────────────────────────────────────┤
│ other      │ • Audio files                                  │
│            │ • Data files                                   │
│            │ • Anything else                                │
└────────────┴────────────────────────────────────────────────┘
```

---

## Form Logic Flow

```
User Opens Form
       │
       ▼
   ┌───────────────┐
   │ ContentType? │
   └───────────────┘
       │       │
       │       └─► "video_tutorial"
       │            │
       │            ▼
       │       ┌──────────────────────┐
       │       │ resultOutputType = 'video' (locked)
       │       │ Show: [Video (Default)]
       │       └──────────────────────┘
       │
       └─► "prompt"
            │
            ▼
       ┌──────────────────────┐
       │ resultOutputType = user choice
       │ Show Dropdown:
       │  ├─ Image ✓
       │  ├─ Text
       │  ├─ Video
       │  ├─ Code
       │  ├─ Design
       │  └─ Other
       └──────────────────────┘
            │
            ▼
       User Selects Value
            │
            ▼
       On Submit:
       ├─ Validate
       ├─ Upload Files
       └─ POST /api/prompts/create
          └─ Include result_output_type in payload
```

---

## Database Schema Changes

```
BEFORE:
┌─────────────────────────────────────┐
│   prompts table                     │
├─────────────────────────────────────┤
│ id (UUID)                           │
│ slug (text, unique)                 │
│ title (text)                        │
│ description (text)                  │
│ model (text)                        │
│ prompt_text (text)                  │
│ result_urls (jsonb)                 │
│ content_type (text)                 │
│ is_premium (boolean)                │
│ price (integer)                     │
│ created_by (uuid)                   │
│ created_at (timestamp)              │
│ status (text)                       │
│ tags (text[])                       │
│ ... other columns                   │
└─────────────────────────────────────┘

AFTER (with migration):
┌──────────────────────────────────────┐
│   prompts table                      │
├──────────────────────────────────────┤
│ id (UUID)                            │
│ slug (text, unique)                  │
│ title (text)                         │
│ description (text)                   │
│ model (text)                         │
│ prompt_text (text)                   │
│ result_urls (jsonb)                  │
│ content_type (text)                  │
│ result_output_type (text) ← NEW      │
│ is_premium (boolean)                 │
│ price (integer)                      │
│ created_by (uuid)                    │
│ created_at (timestamp)               │
│ status (text)                        │
│ tags (text[])                        │
│ ... other columns                    │
└──────────────────────────────────────┘

INDEX: idx_prompts_result_output_type
CONSTRAINT: valid_result_output_type
```

---

## Integration Points

```
Files Modified:
└─ Components
   └─ CreatePromptForm.tsx ✓ (Added resultOutputType state & UI)

└─ API Routes
   └─ /api/prompts/create/route.ts ✓ (Added extraction & validation)

└─ Database
   └─ /sql/migrations/012_add_result_output_type.sql ✓ (Schema change)

Files Created:
└─ Documentation (4 files)
   ├─ IMPLEMENTATION_SUMMARY.md
   ├─ RESULT_OUTPUT_TYPE_GUIDE.md
   ├─ API_QUERY_EXAMPLES.md
   └─ COMPLETE_IMPLEMENTATION_CHECKLIST.md

To Display Output Type (Optional):
├─ /app/my/prompts/page.tsx (add column)
├─ /app/prompt/[slug]/page.tsx (add section)
├─ /components/MarketplaceFilters.tsx (add filter)
└─ /app/api/search/route.ts (add query param)
```

---

## Testing Checklist

```
✓ Database
  ├─ Migration executed
  ├─ Column exists
  └─ Constraint applied

✓ Frontend
  ├─ Form displays output type selector
  ├─ Conditional logic works (dropdown vs read-only)
  └─ Value included in form payload

✓ Backend
  ├─ Extracts result_output_type correctly
  ├─ Auto-sets for video_tutorial
  └─ Saves to database

✓ End-to-End
  ├─ Create prompt with output type
  ├─ Verify in database
  └─ Edit and re-save
```

---

## Timeline

```
NOW:
- Frontend code: ✓ Complete
- Backend code: ✓ Complete
- Database migration: ✓ Ready (needs execution)

NEXT STEP:
1. Execute migration SQL in Supabase
2. Test form creation
3. Verify database records

AFTER:
4. Add display on /my/prompts
5. Add display on detail pages
6. Add filters in marketplace
```
