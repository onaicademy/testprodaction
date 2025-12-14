# Traffic Control & CRM Analytics System

## 🎯 Overview

A comprehensive dashboard for tracking cold traffic performance from Facebook, YouTube, and TikTok ads. Built specifically for info-business (online course sales) with complete sales funnel visibility and CRM integration.

## 📊 Key Features

### 1. **Creative Performance Tracking**
- Individual creative metrics (impressions, clicks, CTR)
- Cost analysis (ad spend, CPC, CPM, CPL, CPA)
- Revenue tracking per creative
- ROI and ROAS calculations
- Conversion rate monitoring

### 2. **Sales Funnel Analysis**
Complete funnel from impression to sale:
1. **Impressions** - Total ad views
2. **Clicks** - Users who clicked on ads
3. **Landing Page Views** - Users who landed
4. **Applications Filled** - Lead form submissions
5. **Calls Scheduled** - Qualified leads who booked calls
6. **Calls Completed** - Actual consultations
7. **Sales** - Course purchases

### 3. **Ad Manager Performance**
- Campaign overview per manager
- Total spend and revenue tracking
- Lead generation metrics
- Sales conversion tracking
- Performance ratings (Excellent, Good, Average, Poor)
- Average CPL and CPA by manager

### 4. **Platform Comparison**
- Facebook, YouTube, TikTok side-by-side
- Budget allocation analysis
- Platform-specific ROI
- Best performing platform identification

### 5. **Trend Analysis**
- Monthly revenue and spend trends
- Lead generation over time
- Sales growth tracking
- Growth metrics and projections

## 🚀 Access the Dashboard

**URL:** `http://localhost:5173/admin/traffic-control`

**Required Role:** Admin or Sales (protected by SalesGuard)

## 📈 Metrics Explained

### Traffic Metrics
- **Impressions**: Total number of times your ad was shown
- **Clicks**: Number of times users clicked on your ad
- **CTR (Click-Through Rate)**: Percentage of impressions that resulted in clicks
- **CPC (Cost Per Click)**: Average cost paid for each click
- **CPM (Cost Per Mille)**: Cost per 1,000 impressions

### Lead Metrics
- **Leads**: Total number of leads generated
- **Qualified Leads**: Leads that meet your quality criteria
- **CPL (Cost Per Lead)**: Average cost to acquire one lead

### Sales Metrics
- **Sales**: Number of course purchases
- **Revenue**: Total money generated
- **CPA (Cost Per Acquisition)**: Average cost to acquire one customer
- **Conversion Rate**: Percentage of leads that became customers

### Performance Metrics
- **ROI (Return on Investment)**: Percentage return on ad spend
  - Formula: `((Revenue - Ad Spend) / Ad Spend) × 100`
- **ROAS (Return on Ad Spend)**: Revenue generated per dollar spent
  - Formula: `Revenue / Ad Spend`

## 🔌 CRM Integration Guide

### Step 1: Connect Your CRM API

Create a new file `src/lib/crm-integration.ts`:

```typescript
import { supabase } from '@/integrations/supabase/client';

export interface CRMCreative {
  id: number;
  name: string;
  platform: 'Facebook' | 'YouTube' | 'TikTok';
  adManager: string;
  status: 'active' | 'paused' | 'testing' | 'stopped';
  
  // Your CRM fields
  campaignId: string;
  adSetId: string;
  adId: string;
  
  // Add your CRM-specific fields here
}

// Function to fetch creatives from your CRM
export async function fetchCreativesFromCRM() {
  // Example: Fetch from Facebook Ads API
  const facebookAds = await fetchFacebookAds();
  
  // Example: Fetch from YouTube Ads API
  const youtubeAds = await fetchYouTubeAds();
  
  // Example: Fetch from TikTok Ads API
  const tiktokAds = await fetchTikTokAds();
  
  return [...facebookAds, ...youtubeAds, ...tiktokAds];
}

// Function to sync CRM data with your database
export async function syncCRMData() {
  const creatives = await fetchCreativesFromCRM();
  
  // Store in your Supabase database
  for (const creative of creatives) {
    await supabase
      .from('ad_creatives')
      .upsert({
        creative_id: creative.id,
        name: creative.name,
        platform: creative.platform,
        ad_manager: creative.adManager,
        // ... other fields
      });
  }
}
```

### Step 2: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Ad Creatives table
CREATE TABLE IF NOT EXISTS ad_creatives (
  id BIGSERIAL PRIMARY KEY,
  creative_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Facebook', 'YouTube', 'TikTok')),
  ad_manager_id BIGINT REFERENCES ad_managers(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'testing', 'stopped')),
  
  -- Traffic metrics
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  
  -- Cost metrics
  ad_spend DECIMAL(10,2) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  cpm DECIMAL(10,2) DEFAULT 0,
  
  -- Lead metrics
  leads INTEGER DEFAULT 0,
  cpl DECIMAL(10,2) DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  
  -- Sales metrics
  sales INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  cpa DECIMAL(10,2) DEFAULT 0,
  
  -- Performance
  roi DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Course info
  course_name TEXT,
  course_price DECIMAL(10,2),
  
  -- Funnel stages
  landing_page_views INTEGER DEFAULT 0,
  applications_filled INTEGER DEFAULT 0,
  calls_scheduled INTEGER DEFAULT 0,
  calls_completed INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Managers table
CREATE TABLE IF NOT EXISTS ad_managers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  platforms TEXT[] DEFAULT '{}',
  
  active_campaigns INTEGER DEFAULT 0,
  total_creatives INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  avg_cpl DECIMAL(10,2) DEFAULT 0,
  avg_cpa DECIMAL(10,2) DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'average', 'poor')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Funnel Events table
CREATE TABLE IF NOT EXISTS funnel_events (
  id BIGSERIAL PRIMARY KEY,
  creative_id TEXT REFERENCES ad_creatives(creative_id),
  user_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'impression', 'click', 'landing_view', 'application', 
    'call_scheduled', 'call_completed', 'sale'
  )),
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only admins and sales can access)
CREATE POLICY "Admin and sales can view creatives"
  ON ad_creatives FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can view managers"
  ON ad_managers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admin and sales can view funnel events"
  ON funnel_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales')
    )
  );
```

### Step 3: Update TrafficControl.tsx to Use Real Data

Replace the mock data imports with real API calls:

```typescript
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Inside the component
const [creatives, setCreatives] = useState<Creative[]>([]);
const [adManagers, setAdManagers] = useState<AdManager[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    setLoading(true);
    
    // Fetch creatives
    const { data: creativesData } = await supabase
      .from('ad_creatives')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Fetch ad managers
    const { data: managersData } = await supabase
      .from('ad_managers')
      .select('*')
      .order('total_revenue', { ascending: false });
    
    if (creativesData) setCreatives(creativesData);
    if (managersData) setAdManagers(managersData);
    
    setLoading(false);
  }
  
  fetchData();
}, []);
```

### Step 4: Platform-Specific API Integration

#### Facebook Ads Integration

```typescript
async function fetchFacebookAds() {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/act_YOUR_AD_ACCOUNT_ID/insights?fields=campaign_name,impressions,clicks,spend,actions&access_token=YOUR_ACCESS_TOKEN`
  );
  
  const data = await response.json();
  
  return data.data.map(ad => ({
    id: ad.campaign_id,
    name: ad.campaign_name,
    platform: 'Facebook',
    impressions: ad.impressions,
    clicks: ad.clicks,
    adSpend: ad.spend,
    // Map other fields
  }));
}
```

#### YouTube Ads Integration

```typescript
async function fetchYouTubeAds() {
  // Use Google Ads API
  const response = await fetch(
    `https://googleads.googleapis.com/v14/customers/YOUR_CUSTOMER_ID/googleAds:search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_ACCESS_TOKEN`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          SELECT 
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros
          FROM campaign
          WHERE segments.date DURING LAST_30_DAYS
        `
      })
    }
  );
  
  const data = await response.json();
  // Process and return
}
```

#### TikTok Ads Integration

```typescript
async function fetchTikTokAds() {
  const response = await fetch(
    `https://business-api.tiktok.com/open_api/v1.3/reports/integrated/get/`,
    {
      method: 'GET',
      headers: {
        'Access-Token': 'YOUR_ACCESS_TOKEN'
      }
    }
  );
  
  const data = await response.json();
  // Process and return
}
```

### Step 5: Automated Data Sync

Create a cron job or use Supabase Edge Functions:

```typescript
// supabase/functions/sync-ad-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Fetch from Facebook, YouTube, TikTok
  const facebookData = await fetchFacebookAds();
  const youtubeData = await fetchYouTubeAds();
  const tiktokData = await fetchTikTokAds();

  // Sync to database
  await syncToDatabase(supabase, [...facebookData, ...youtubeData, ...tiktokData]);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

Schedule this to run every hour using Supabase cron:

```sql
SELECT cron.schedule(
  'sync-ad-data',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/sync-ad-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

## 🎨 Customization

### Adding New Platforms

1. Update the `Creative` interface in `TrafficControl.tsx`
2. Add platform-specific colors in `platformDistribution`
3. Add API integration in your sync function

### Custom Metrics

Add new metrics to the KPI cards section:

```typescript
<Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium flex items-center gap-2">
      <YourIcon className="w-4 h-4" />
      Your Custom Metric
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{yourValue}</div>
    <p className="text-indigo-100 text-xs mt-1">Your description</p>
  </CardContent>
</Card>
```

## 📱 Export & Reporting

The dashboard includes an export button. To implement:

```typescript
const handleExport = () => {
  const csvData = creatives.map(c => ({
    'Creative Name': c.name,
    'Platform': c.platform,
    'Ad Spend': c.adSpend,
    'Revenue': c.revenue,
    'ROI': c.roi,
    // ... other fields
  }));

  const csv = convertToCSV(csvData);
  downloadCSV(csv, 'traffic-report.csv');
};
```

## 🔒 Security

- Protected by `SalesGuard` - only admin and sales roles can access
- All data queries use Row Level Security (RLS)
- API keys stored in environment variables
- No sensitive data exposed to frontend

## 🚀 Next Steps

1. **Connect your CRM**: Follow integration guide above
2. **Set up database tables**: Run the SQL migrations
3. **Configure API keys**: Add to `.env` file
4. **Test with sample data**: Verify all metrics calculate correctly
5. **Schedule sync**: Set up automated data synchronization
6. **Train your team**: Show sales managers how to use the dashboard

## 📞 Support

For questions or issues, contact your development team.

---

**Built with**: React, TypeScript, Recharts, Shadcn UI, Supabase
**Version**: 1.0.0
**Last Updated**: December 2024
