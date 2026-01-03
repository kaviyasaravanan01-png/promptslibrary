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
  created_by_email VARCHAR(255) -- store for audit trail
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_reports_prompt_id ON reports(prompt_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_prompt_status ON reports(prompt_id, status);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can create reports"
  ON reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all reports (we'll add admin check in app)
CREATE POLICY "Admins can view all reports"
  ON reports
  FOR SELECT
  USING (TRUE);

-- Admins can update reports (we'll verify in app)
CREATE POLICY "Admins can update reports"
  ON reports
  FOR UPDATE
  USING (TRUE);

COMMENT ON TABLE reports IS 'User reports/flags for problematic prompts';
COMMENT ON COLUMN reports.reason IS 'Category of report: spam, inappropriate content, copyrighted, broken link, misleading, other';
COMMENT ON COLUMN reports.status IS 'Report lifecycle: open -> reviewing -> resolved/dismissed';
