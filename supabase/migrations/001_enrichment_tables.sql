-- Ekko CRM Enrichment & Actions Tables Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Contact Enrichments Table
-- ============================================
CREATE TABLE IF NOT EXISTS contact_enrichments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  -- LinkedIn Data
  linkedin_url TEXT,
  linkedin_headline TEXT,
  linkedin_summary TEXT,

  -- Company Data
  company_description TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_website TEXT,
  company_funding_stage TEXT,

  -- Social Profiles
  twitter_url TEXT,
  github_url TEXT,

  -- Recent News (array of {title, url, date, source})
  recent_news JSONB DEFAULT '[]',

  -- Enrichment Status
  enrichment_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  last_enriched_at TIMESTAMPTZ,
  enrichment_error TEXT,
  raw_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_contact_enrichments_contact_id ON contact_enrichments(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_enrichments_status ON contact_enrichments(enrichment_status);

-- RLS Policy
ALTER TABLE contact_enrichments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON contact_enrichments FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 2. Add enrichment_status to contacts
-- ============================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending';

-- ============================================
-- 3. Smart Actions Table
-- ============================================
CREATE TABLE IF NOT EXISTS smart_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- 'follow_up', 'priority', 'email_draft'
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Action Details
  title TEXT NOT NULL,
  description TEXT,
  suggested_action TEXT,
  priority_score FLOAT,

  -- Email Draft Fields
  email_subject TEXT,
  email_body TEXT,
  email_tone TEXT, -- 'professional', 'friendly', 'formal'

  -- Status
  status TEXT DEFAULT 'pending', -- pending, dismissed, completed
  snoozed_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_smart_actions_contact_id ON smart_actions(contact_id);
CREATE INDEX IF NOT EXISTS idx_smart_actions_status ON smart_actions(status);
CREATE INDEX IF NOT EXISTS idx_smart_actions_type ON smart_actions(action_type);

-- RLS Policy
ALTER TABLE smart_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON smart_actions FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 4. Contact Interactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'email_sent', 'call', 'meeting', 'note_added', 'voice_command'
  interaction_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_date ON contact_interactions(interaction_date);

-- RLS Policy
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON contact_interactions FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. Updated_at Triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_enrichments_updated_at
  BEFORE UPDATE ON contact_enrichments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_actions_updated_at
  BEFORE UPDATE ON smart_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
