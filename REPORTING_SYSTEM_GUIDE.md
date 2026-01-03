# Reporting System - Complete Setup & Testing Guide

## 📋 Database Setup

Execute this SQL in your Supabase SQL Editor (or run migration 017):

```sql
-- Create reports table for prompt flagging/abuse reporting
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'copyrighted', 'broken', 'misleading', 'other')),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email VARCHAR(255)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_reports_prompt_id ON reports(prompt_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_prompt_status ON reports(prompt_id, status);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT USING (TRUE);

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE USING (TRUE);
```

## 🎯 Feature Overview

### User Side (Prompt Page)
- **Report Button**: Appears next to Favorite button on every approved prompt
- **Report Modal**: 6 reason categories with optional description
- **Validation**: Users can't report the same prompt twice
- **Confirmation**: Success message on submission

### Admin Side (Dashboard)
- **URL**: `/admin/reports`
- **Stats**: Open, Reviewing, Resolved, Dismissed counts
- **Filters**: By status and reason category
- **Actions**:
  - Start Review (change status to reviewing)
  - Take Action (resolved with admin notes)
  - Dismiss (dismiss false reports)
  - View Prompt (link to prompt page)

## 📁 Files Created

### Backend
- `app/api/reports/route.ts` - POST create report, GET user's reports
- `app/api/admin/reports/route.ts` - GET all reports (admin), PATCH update report status

### Frontend Components
- `components/ReportButton.tsx` - Button that opens report modal
- `components/ReportModal.tsx` - Modal with form and reason selection

### Pages
- `app/admin/reports/page.tsx` - Admin dashboard for managing reports
- Updated `app/prompt/[slug]/page.tsx` - Added ReportButton component

### Database
- `sql/migrations/017_create_reports_table.sql` - Table, indexes, and RLS policies

## 🧪 Testing Checklist

### Pre-requisites
1. Run migration 017 in Supabase SQL Editor
2. Server is running: `npm run dev`
3. You're signed in with a user account

### Test Flow 1: User Reports a Prompt

- [ ] Navigate to any approved prompt page
- [ ] Click "Report" button (red with icon, next to Favorite)
- [ ] Select a reason from the 6 options
- [ ] (Optional) Add description in text area
- [ ] Click "Submit Report"
- [ ] Verify success message appears
- [ ] Verify button closes after 1.5 seconds
- [ ] Try reporting same prompt again - should show error "You have already reported this prompt"

### Test Flow 2: Admin Views Reports

- [ ] Navigate to `/admin/reports`
- [ ] If not admin (email != kaviyasaravanan01@gmail.com), should see "Access denied"
- [ ] If admin, verify page loads with:
  - [ ] Stats cards showing Open, Reviewing, Resolved, Dismissed counts
  - [ ] Filter dropdowns for Status and Reason
  - [ ] List of reports
- [ ] Click on a report to expand it
- [ ] Verify you see:
  - [ ] Reason badge with icon
  - [ ] Status badge
  - [ ] Reporter email
  - [ ] Created date
  - [ ] Report description (if provided)
  - [ ] Link to prompt

### Test Flow 3: Admin Actions

- [ ] Expand an "open" report
- [ ] Click "Start Review" button
- [ ] Verify review form appears with:
  - [ ] "Admin Notes" textarea
  - [ ] "Take Action" button (green - marks as resolved)
  - [ ] "Dismiss" button (gray - marks as dismissed)
  - [ ] "Cancel" button
- [ ] Add admin notes: "Checked - prompt violates guidelines"
- [ ] Click "Take Action"
- [ ] Verify report status changes to "resolved"
- [ ] Test "Dismiss" on another report
- [ ] Verify report status changes to "dismissed"

### Test Flow 4: Filters

- [ ] Click Status filter dropdown
- [ ] Select "Resolved"
- [ ] Verify only resolved reports show
- [ ] Click Status again, select "Open"
- [ ] Click Reason filter dropdown
- [ ] Select "Spam"
- [ ] Verify only spam reports show
- [ ] Click "Refresh" button
- [ ] Verify data refreshes

### Test Flow 5: Error Handling

- [ ] Try submitting report without selecting reason
  - [ ] Should show "Please select a reason"
- [ ] Try submitting while not signed in
  - [ ] Should show "Please sign in to report"
- [ ] Break the API (disable supabaseAdmin temporarily)
  - [ ] Should show error message gracefully

## 🔍 Database Verification

Run these queries in Supabase to verify setup:

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'reports';

-- Check policies
SELECT policyname, qual FROM pg_policies WHERE tablename = 'reports';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'reports';

-- Check sample data (if exists)
SELECT id, prompt_id, reason, status, created_at FROM reports LIMIT 5;
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access denied" on admin page | Check ADMIN_EMAIL env/code matches your email |
| Report button not showing | Verify prompt status is 'approved' |
| "Already reported" error | User can only report once per prompt |
| Admin dashboard blank | Check Supabase connection and auth token |
| Modal won't close | Verify supabase.auth.getSession() works |
| 401 errors on API | Verify Bearer token is being sent correctly |

## 📊 Performance Notes

- **Report Listing**: Indexed by created_at DESC for fast pagination
- **User Duplicate Check**: Indexed by (prompt_id, user_id, status)
- **Admin Filters**: Indexed by status, reason, prompt_id
- **Soft Deletes**: Reports aren't deleted, just marked 'dismissed'

## 🔒 Security Considerations

- ✅ RLS policies prevent users from seeing other users' reports
- ✅ Admin check enforced on both frontend and backend
- ✅ Duplicate report prevention per (user, prompt)
- ✅ Service role key used for admin operations
- ✅ Audit trail with created_by_email and resolved_by user_id

## Next Steps

After verification:
1. Deploy to production
2. Announce feature to users (pop-up or banner)
3. Monitor reports for patterns
4. Consider automated actions (auto-remove if 5+ spam reports)
5. Add appeal mechanism for creators

## API Reference

### POST /api/reports
Submit a new report

**Request:**
```json
{
  "promptId": "uuid",
  "reason": "spam|inappropriate|copyrighted|broken|misleading|other",
  "description": "Optional details"
}
```

**Response:**
```json
{
  "ok": true,
  "report": { ... }
}
```

### GET /api/reports
Get user's own reports

**Response:**
```json
{
  "ok": true,
  "reports": [ ... ]
}
```

### GET /api/admin/reports
Get all reports (admin only)

**Query Params:**
- `status`: open|reviewing|resolved|dismissed|all
- `reason`: spam|inappropriate|copyrighted|broken|misleading|other

**Response:**
```json
{
  "ok": true,
  "reports": [ ... ]
}
```

### PATCH /api/admin/reports
Update report status (admin only)

**Request:**
```json
{
  "reportId": "uuid",
  "status": "reviewing|resolved|dismissed",
  "adminNotes": "Optional notes"
}
```

**Response:**
```json
{
  "ok": true,
  "report": { ... }
}
```
