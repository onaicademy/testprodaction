-- ================================================================
-- TRAFFIC CONTROL & CRM ANALYTICS - DATABASE SCHEMA
-- ================================================================
-- This script creates all necessary tables for the Traffic Control system
-- Run this in your Supabase SQL Editor when ready to use real data
-- ================================================================

-- ----------------------------------------------------------------
-- 1. AD MANAGERS TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_managers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  platforms TEXT[] DEFAULT '{}', -- e.g., ['Facebook', 'YouTube', 'TikTok']
  
  -- Campaign metrics
  active_campaigns INTEGER DEFAULT 0,
  total_creatives INTEGER DEFAULT 0,
  
  -- Financial metrics
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  
  -- Lead metrics
  total_leads INTEGER DEFAULT 0,
  avg_cpl DECIMAL(10,2) DEFAULT 0, -- Average Cost Per Lead
  
  -- Sales metrics
  total_sales INTEGER DEFAULT 0,
  avg_cpa DECIMAL(10,2) DEFAULT 0, -- Average Cost Per Acquisition
  
  -- Performance
  roi DECIMAL(10,2) DEFAULT 0, -- Return on Investment (%)
  performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'average', 'poor')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. AD CREATIVES TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_creatives (
  id BIGSERIAL PRIMARY KEY,
  creative_id TEXT UNIQUE NOT NULL, -- External ID from ad platform
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Facebook', 'YouTube', 'TikTok')),
  ad_manager_id BIGINT REFERENCES ad_managers(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'testing', 'stopped')) DEFAULT 'active',
  
  -- Traffic metrics
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0, -- Click-Through Rate (%)
  
  -- Cost metrics
  ad_spend DECIMAL(12,2) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0, -- Cost Per Click
  cpm DECIMAL(10,2) DEFAULT 0, -- Cost Per Mille (1000 impressions)
  
  -- Lead metrics
  leads INTEGER DEFAULT 0,
  cpl DECIMAL(10,2) DEFAULT 0, -- Cost Per Lead
  qualified_leads INTEGER DEFAULT 0,
  
  -- Sales metrics
  sales INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  cpa DECIMAL(10,2) DEFAULT 0, -- Cost Per Acquisition
  
  -- Performance metrics
  roi DECIMAL(10,2) DEFAULT 0, -- Return on Investment (%)
  roas DECIMAL(10,2) DEFAULT 0, -- Return on Ad Spend (multiplier)
  conversion_rate DECIMAL(5,2) DEFAULT 0, -- Lead to Sale conversion (%)
  
  -- Course information
  course_name TEXT,
  course_price DECIMAL(10,2),
  
  -- Sales funnel metrics
  landing_page_views INTEGER DEFAULT 0,
  applications_filled INTEGER DEFAULT 0,
  calls_scheduled INTEGER DEFAULT 0,
  calls_completed INTEGER DEFAULT 0,
  
  -- External references
  campaign_id TEXT, -- External campaign ID
  ad_set_id TEXT, -- External ad set ID
  ad_id TEXT, -- External ad ID
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------
-- 3. FUNNEL EVENTS TABLE (for detailed tracking)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS funnel_events (
  id BIGSERIAL PRIMARY KEY,
  creative_id TEXT REFERENCES ad_creatives(creative_id) ON DELETE CASCADE,
  user_id UUID, -- Optional: link to actual user if available
  session_id TEXT, -- Track unique sessions
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'impression',
    'click',
    'landing_view',
    'application',
    'call_scheduled',
    'call_completed',
    'sale'
  )),
  
  -- Event metadata
  event_data JSONB DEFAULT '{}', -- Flexible field for additional data
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 4. PLATFORM STATS TABLE (daily aggregated stats)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_daily_stats (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('Facebook', 'YouTube', 'TikTok')),
  date DATE NOT NULL,
  
  -- Aggregated metrics
  total_impressions BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  total_spend DECIMAL(12,2) DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  
  -- Calculated metrics
  avg_ctr DECIMAL(5,2) DEFAULT 0,
  avg_cpl DECIMAL(10,2) DEFAULT 0,
  avg_cpa DECIMAL(10,2) DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(platform, date)
);

-- ----------------------------------------------------------------
-- 5. INDEXES for Performance
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ad_creatives_platform ON ad_creatives(platform);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_status ON ad_creatives(status);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_manager ON ad_creatives(ad_manager_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_created_at ON ad_creatives(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funnel_events_creative ON funnel_events(creative_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_type ON funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_funnel_events_timestamp ON funnel_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session ON funnel_events(session_id);

CREATE INDEX IF NOT EXISTS idx_platform_stats_date ON platform_daily_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_stats_platform ON platform_daily_stats(platform);

-- ----------------------------------------------------------------
-- 6. FUNCTIONS for Auto-calculating Metrics
-- ----------------------------------------------------------------

-- Function to update creative metrics
CREATE OR REPLACE FUNCTION update_creative_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate CTR
  IF NEW.impressions > 0 THEN
    NEW.ctr = (NEW.clicks::DECIMAL / NEW.impressions::DECIMAL) * 100;
  END IF;
  
  -- Calculate CPC
  IF NEW.clicks > 0 THEN
    NEW.cpc = NEW.ad_spend / NEW.clicks;
  END IF;
  
  -- Calculate CPM
  IF NEW.impressions > 0 THEN
    NEW.cpm = (NEW.ad_spend / NEW.impressions) * 1000;
  END IF;
  
  -- Calculate CPL
  IF NEW.leads > 0 THEN
    NEW.cpl = NEW.ad_spend / NEW.leads;
  END IF;
  
  -- Calculate CPA
  IF NEW.sales > 0 THEN
    NEW.cpa = NEW.ad_spend / NEW.sales;
  END IF;
  
  -- Calculate ROI
  IF NEW.ad_spend > 0 THEN
    NEW.roi = ((NEW.revenue - NEW.ad_spend) / NEW.ad_spend) * 100;
  END IF;
  
  -- Calculate ROAS
  IF NEW.ad_spend > 0 THEN
    NEW.roas = NEW.revenue / NEW.ad_spend;
  END IF;
  
  -- Calculate Conversion Rate
  IF NEW.leads > 0 THEN
    NEW.conversion_rate = (NEW.sales::DECIMAL / NEW.leads::DECIMAL) * 100;
  END IF;
  
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate metrics
CREATE TRIGGER trigger_update_creative_metrics
  BEFORE INSERT OR UPDATE ON ad_creatives
  FOR EACH ROW
  EXECUTE FUNCTION update_creative_metrics();

-- ----------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE ad_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies: Only admin and sales roles can access
CREATE POLICY "Admin and sales can view ad_managers"
  ON ad_managers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can manage ad_managers"
  ON ad_managers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin and sales can view ad_creatives"
  ON ad_creatives FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can manage ad_creatives"
  ON ad_creatives FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin and sales can view funnel_events"
  ON funnel_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can view platform_stats"
  ON platform_daily_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales')
    )
  );

-- ----------------------------------------------------------------
-- 8. SAMPLE DATA (Optional - for testing)
-- ----------------------------------------------------------------

-- Uncomment to insert sample ad managers
/*
INSERT INTO ad_managers (name, email, platforms, total_spent, total_revenue, total_leads, total_sales, roi, performance_rating) VALUES
  ('Anna Smirnova', 'anna@example.com', ARRAY['Facebook'], 45000, 425860, 2432, 198, 846, 'excellent'),
  ('Ivan Petrov', 'ivan@example.com', ARRAY['YouTube'], 38000, 298450, 841, 78, 685, 'good'),
  ('Maria Volkova', 'maria@example.com', ARRAY['TikTok'], 32000, 489520, 3636, 357, 1430, 'excellent'),
  ('Dmitry Kozlov', 'dmitry@example.com', ARRAY['Facebook'], 28000, 272450, 986, 70, 873, 'good');
*/

-- ================================================================
-- INSTALLATION COMPLETE
-- ================================================================
-- Next steps:
-- 1. Verify tables are created: SELECT * FROM ad_creatives LIMIT 1;
-- 2. Test RLS: Make sure only admin/sales can access
-- 3. Set up API integration (see TRAFFIC_CONTROL_SYSTEM.md)
-- 4. Configure automated data sync
-- ================================================================
