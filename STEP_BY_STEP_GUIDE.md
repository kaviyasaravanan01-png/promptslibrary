# Step-by-Step: How to Complete the Result Output Type Feature

## STEP 1: Run Database Migration ⚡

### 1.1 Go to Supabase Console
1. Open: https://supabase.com/dashboard
2. Select your project: `promptslibrary`
3. Go to: **SQL Editor** (left sidebar)

### 1.2 Create New Query
1. Click: **New Query**
2. Copy and paste the SQL below:

```sql
-- Migration 012: Add result_output_type to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS result_output_type text DEFAULT 'image';

CREATE INDEX IF NOT EXISTS idx_prompts_result_output_type ON prompts(result_output_type);

ALTER TABLE prompts ADD CONSTRAINT valid_result_output_type 
  CHECK (result_output_type IN ('image', 'text', 'video', 'code', 'design', 'other'));
```

### 1.3 Execute Query
1. Click: **RUN** button (top right)
2. Wait for success message ✓

### 1.4 Verify Success
1. Click: **New Query**
2. Paste this verification SQL:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'prompts' 
  AND column_name = 'result_output_type';
```

3. Click: **RUN**
4. You should see:
   ```
   column_name       | data_type | column_default
   result_output_type| text      | 'image'::text
   ```

✅ **Database migration complete!**

---

## STEP 2: Test the Feature 🧪

### 2.1 Start Your App
```bash
npm run dev
```

### 2.2 Go to Create Prompt Page
1. Open: http://localhost:3000/my/prompts
2. Click: **Create New Prompt** (or similar button)

### 2.3 Test Prompt Creation (Type 1)
**Create a Prompt with Image Output:**

1. **Content Type** → Select "Prompt"
   - ✓ You should see "Expected Output Type" dropdown appear
   
2. **Expected Output Type** → Select "Image"
   - ✓ Dropdown shows: Image, Text, Video, Code, Design, Other
   
3. Fill in other fields:
   - Title: "Test Anime Generator"
   - Slug: "test-anime-generator"
   - Description: "Generate anime characters"
   - Prompt Text: "Create 5 anime characters..."
   
4. Upload result images (or skip)
5. Click: **Create**
6. ✓ Should say "Prompt saved (pending review)" or "Prompt saved"

### 2.4 Test Prompt Creation (Type 2)
**Create a Video Tutorial with Auto-set Output:**

1. **Content Type** → Select "Video Tutorial"
   - ✓ "Expected Output Type" should change to read-only box saying "Video (Default)"
   
2. Fill in other fields:
   - Title: "Midjourney Tutorial"
   - Slug: "midjourney-tutorial"
   - Description: "Learn how to use Midjourney"
   - Prompt Text: "Tutorial content..."
   
3. Click: **Create**
4. ✓ Should save successfully with output_type = "video"

### 2.5 Verify Database
1. Go to Supabase SQL Editor
2. Run this query:

```sql
SELECT id, title, content_type, result_output_type 
FROM prompts 
ORDER BY created_at DESC 
LIMIT 5;
```

3. ✓ You should see your new prompts with correct output types:
   - Test Anime Generator | prompt | image
   - Midjourney Tutorial | video_tutorial | video

---

## STEP 3: Test Form Editing 📝

### 3.1 Edit Existing Prompt
1. Go to: http://localhost:3000/my/prompts
2. Click: **Edit** on any prompt
3. Check the form loads correctly
4. ✓ Result Output Type field should be pre-filled with existing value
5. Try changing it (e.g., image → code)
6. Click: **Save**
7. ✓ Should update successfully

### 3.2 Verify Updated Value
```sql
SELECT id, title, result_output_type 
FROM prompts 
WHERE id = 'your-prompt-id';
```

---

## STEP 4: Common Issues & Fixes 🔧

### Issue 1: Column doesn't exist error
**Error message:** `column "result_output_type" of relation "prompts" does not exist`

**Fix:**
1. Check if migration ran in Supabase
2. Run the migration SQL again
3. Refresh the page

### Issue 2: Form doesn't show output type selector
**Problem:** You don't see the dropdown after selecting "Prompt"

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check browser console for errors (F12)

### Issue 3: Video tutorial won't auto-set to "video"
**Problem:** Selecting "Video Tutorial" doesn't update the output type field

**Fix:**
1. Check CreatePromptForm.tsx line 184:
   ```tsx
   onChange={e => { 
     setContentType(e.target.value); 
     if (e.target.value === 'video_tutorial') setResultOutputType('video'); 
   }}
   ```
2. Refresh page if change was recent

### Issue 4: Form submission fails
**Error:** `Insert error: result_output_type`

**Fix:**
1. Make sure you selected a valid output type
2. Check the value is in: image, text, video, code, design, other
3. Run verification SQL to confirm column exists

---

## STEP 5: Display Output Type (Optional) ✨

### Option A: Show on /my/prompts List
Edit: `/app/my/prompts/page.tsx`

Add to table header:
```tsx
<th>Output Type</th>
```

Add to table row:
```tsx
<td>{prompt.result_output_type}</td>
```

### Option B: Show on Prompt Detail Page
Edit: `/app/prompt/[slug]/page.tsx`

Add after model display:
```tsx
<p className="text-sm text-gray-400">
  Expected Output: 
  <span className="text-white font-semibold ml-2">
    {data.result_output_type.charAt(0).toUpperCase() + data.result_output_type.slice(1)}
  </span>
</p>
```

### Option C: Add Filter in Marketplace
Edit: `/components/MarketplaceFilters.tsx`

Add new filter:
```tsx
<div>
  <label className="text-sm font-semibold">Output Type</label>
  <select value={filters.outputType || ''} 
          onChange={(e) => setFilters({...filters, outputType: e.target.value})}
          className="w-full p-2 bg-black/20 rounded mt-2">
    <option value="">All Types</option>
    <option value="image">Image</option>
    <option value="text">Text</option>
    <option value="video">Video</option>
    <option value="code">Code</option>
    <option value="design">Design</option>
    <option value="other">Other</option>
  </select>
</div>
```

---

## STEP 6: Verify Everything Works ✅

### Final Checklist
- [ ] Database migration executed ✓
- [ ] Column exists in prompts table ✓
- [ ] Form shows output type selector ✓
- [ ] Prompt creation saves correctly ✓
- [ ] Video tutorial auto-sets to "video" ✓
- [ ] Edit prompt loads correct output type ✓
- [ ] Database query shows correct values ✓

### Test Query (Copy & Paste)
```sql
-- This shows all your new prompts with their output types
SELECT 
  id,
  title,
  content_type,
  result_output_type,
  created_at
FROM prompts
WHERE result_output_type IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

## TROUBLESHOOTING COMMAND REFERENCE

### If form broke after changes:
```bash
# Clear cache and restart
npm run dev
# Then hard refresh browser: Ctrl+Shift+R
```

### If you need to rollback migration:
```sql
-- Only if something went wrong:
ALTER TABLE prompts DROP COLUMN result_output_type CASCADE;
DROP INDEX IF EXISTS idx_prompts_result_output_type;
```

### If you want to check migration status:
```sql
SELECT * FROM prompts LIMIT 1 \gx
-- This shows all columns in the prompts table
```

---

## Success Indicators ✨

You'll know everything is working when:

1. ✅ Form loads with "Expected Output Type" field
2. ✅ Dropdown shows 6 options for prompts
3. ✅ "Video Tutorial" shows read-only "Video (Default)"
4. ✅ Prompt creation succeeds
5. ✅ Database contains new column with correct values
6. ✅ Editing a prompt preserves output type
7. ✅ No console errors (F12)

---

## Time Estimate

- Database migration: **2 minutes** ⚡
- Testing form: **5 minutes** 🧪
- Verifying database: **2 minutes** ✓
- Adding displays (optional): **10 minutes** ✨

**Total: 10-20 minutes** depending on if you add display options.

---

## Need Help?

If something doesn't work:
1. Check the error message carefully
2. Look in browser console (F12)
3. Verify migration was executed in Supabase
4. Refresh page (Ctrl+Shift+R)
5. Check that files were saved

Good luck! 🚀
