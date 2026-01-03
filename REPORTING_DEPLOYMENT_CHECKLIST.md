# Reporting System - Deployment Checklist ✅

## Pre-Deployment

- [ ] All files created successfully
  - [ ] `sql/migrations/017_create_reports_table.sql`
  - [ ] `app/api/reports/route.ts`
  - [ ] `app/api/admin/reports/route.ts`
  - [ ] `components/ReportButton.tsx`
  - [ ] `components/ReportModal.tsx`
  - [ ] `app/admin/reports/page.tsx`
  - [ ] `app/prompt/[slug]/page.tsx` (updated)

- [ ] No compilation errors (rebuild if needed)
  ```bash
  npm run build
  ```

- [ ] Server runs without issues
  ```bash
  npm run dev
  ```

## Database Setup

- [ ] Open Supabase SQL Editor
- [ ] Copy entire content from `sql/migrations/017_create_reports_table.sql`
- [ ] Execute all SQL statements
- [ ] Verify in "Tables" section:
  - [ ] `reports` table exists
  - [ ] Columns match schema
  - [ ] Indexes created
  - [ ] RLS policies enabled

## Testing (Local)

### User Flow
- [ ] Visit an approved prompt page
- [ ] Report button visible next to Favorite button
- [ ] Click Report button → Modal opens
- [ ] Select a report reason
- [ ] Optionally add description
- [ ] Click "Submit Report"
- [ ] Success message shows
- [ ] Modal closes after 1.5 seconds
- [ ] Try reporting same prompt again → "Already reported" error

### Admin Flow
- [ ] Navigate to `/admin/reports`
- [ ] Stats cards display (Open: X, Reviewing: Y, Resolved: Z, Dismissed: W)
- [ ] Reports list shows your submitted report
- [ ] Click report to expand
- [ ] "Start Review" button visible
- [ ] Click "Start Review"
- [ ] Add admin notes
- [ ] Click "Take Action" → Status changes to "Resolved"
- [ ] Verify resolved_at timestamp is set
- [ ] Test "Dismiss" button on another report
- [ ] Test filters:
  - [ ] Status filter works
  - [ ] Reason filter works
  - [ ] Refresh button works

### Error Cases
- [ ] Submit without selecting reason → Error shows
- [ ] Sign out, try to report → "Please sign in" error
- [ ] Try to access admin dashboard without admin email → "Access denied"

## Production Checklist

### Before Pushing to Git
- [ ] Run: `npm run build` (no errors)
- [ ] Run: `npm run lint` (if configured)
- [ ] Test locally one more time

### Supabase Production
- [ ] Connect to production database
- [ ] Execute migration 017 SQL
- [ ] Verify tables created
- [ ] Run test: submit report from test account
- [ ] Verify in Supabase Tables → reports
- [ ] Test admin dashboard with production data

### Deployment
- [ ] Push to git: `git add . && git commit -m "Add reporting system" && git push`
- [ ] Deploy to production (Vercel/your platform)
- [ ] Test in production environment
- [ ] Monitor for errors in logs

## Post-Deployment

### Immediate
- [ ] Announce feature to users (optional)
- [ ] Monitor admin dashboard for reports
- [ ] Watch server logs for errors
- [ ] Test on different browsers/devices

### Follow-up (1 week)
- [ ] Review reported prompts
- [ ] Take action on legitimate reports
- [ ] Identify patterns in abuse
- [ ] Consider automation rules

### Future Enhancements
- [ ] Auto-remove prompts with 5+ spam reports
- [ ] Email notifications to admin on new reports
- [ ] Appeal system for creators
- [ ] Report statistics dashboard
- [ ] Automated content scanning (NSFW, etc.)

## Rollback Plan (if needed)

If issues occur:

1. **Frontend Issue**
   ```bash
   # Remove ReportButton from prompt page
   # Revert: app/prompt/[slug]/page.tsx
   git revert <commit>
   ```

2. **Backend Issue**
   ```bash
   # Disable reporting API (comment out routes)
   # Don't delete database table
   ```

3. **Database Issue**
   ```sql
   -- Drop and recreate
   DROP TABLE reports CASCADE;
   -- Re-execute migration
   ```

## Support URLs

- Admin Dashboard: `/admin/reports`
- Reporting System Guide: `REPORTING_SYSTEM_GUIDE.md`
- Implementation Docs: `REPORTING_IMPLEMENTATION.md`

## Quick Reference

**Test Credentials:**
- Admin Email: `kaviyasaravanan01@gmail.com`
- Test Reasons: spam, inappropriate, copyrighted, broken, misleading, other
- Report Statuses: open, reviewing, resolved, dismissed

**Key Files:**
- Migration: `sql/migrations/017_create_reports_table.sql`
- User API: `app/api/reports/route.ts`
- Admin API: `app/api/admin/reports/route.ts`
- Admin Page: `app/admin/reports/page.tsx`

## Sign-off

- [ ] All tests passed
- [ ] Ready for production
- [ ] Database migrated
- [ ] Frontend deployed
- [ ] Admin dashboard working
- [ ] Team notified

**Deployed By:** _______________
**Deployment Date:** _______________
**Production URL:** _______________
