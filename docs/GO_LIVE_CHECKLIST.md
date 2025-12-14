# 🚀 Go Live Checklist - Traffic Control System

Use this checklist to transition from demo data to production with real advertising metrics.

---

## Phase 1: Database Setup ⏱️ 2-3 hours

### Step 1: Backup Current Database
- [ ] Export current Supabase schema
- [ ] Save backup to secure location
- [ ] Document current table structures

### Step 2: Create Traffic Control Tables
- [ ] Open Supabase SQL Editor
- [ ] Copy content from `DATABASE_TRAFFIC_CONTROL.sql`
- [ ] Run the SQL script
- [ ] Verify all 4 tables are created:
  - [ ] `ad_managers`
  - [ ] `ad_creatives`
  - [ ] `funnel_events`
  - [ ] `platform_daily_stats`

### Step 3: Verify Database
```sql
-- Run these queries to verify:
SELECT COUNT(*) FROM ad_managers;
SELECT COUNT(*) FROM ad_creatives;
SELECT COUNT(*) FROM funnel_events;
SELECT COUNT(*) FROM platform_daily_stats;
```
- [ ] All queries return 0 (empty tables - expected)
- [ ] No errors in console

### Step 4: Test Row Level Security
- [ ] Log in as admin user
- [ ] Run: `SELECT * FROM ad_creatives LIMIT 1;`
- [ ] Should work without error
- [ ] Log in as student user
- [ ] Run same query
- [ ] Should return "permission denied" (expected)

---

## Phase 2: Ad Manager Setup ⏱️ 30 minutes

### Step 1: Add Your Ad Managers
```sql
INSERT INTO ad_managers (name, email, platforms) VALUES
  ('Your Name 1', 'email1@company.com', ARRAY['Facebook']),
  ('Your Name 2', 'email2@company.com', ARRAY['YouTube']),
  ('Your Name 3', 'email3@company.com', ARRAY['TikTok']);
```
- [ ] Update names with real team members
- [ ] Update emails with actual addresses
- [ ] Assign correct platforms

### Step 2: Verify Manager Accounts
- [ ] Check all managers appear in dashboard
- [ ] Navigate to Ad Managers tab
- [ ] Verify names and platforms are correct

---

## Phase 3: API Integration ⏱️ 2-4 days

### Facebook Ads API

#### Prerequisites
- [ ] Facebook Business account exists
- [ ] Ad account ID ready
- [ ] Business Manager access configured

#### Setup Steps
- [ ] Go to https://developers.facebook.com
- [ ] Create new app (Business type)
- [ ] Add Marketing API product
- [ ] Generate access token
- [ ] Get access token with permissions:
  - `ads_read`
  - `ads_management`
  - `business_management`
- [ ] Test API with Graph API Explorer
- [ ] Save access token to environment variables

#### Environment Variables
```env
FACEBOOK_ACCESS_TOKEN=your_token_here
FACEBOOK_AD_ACCOUNT_ID=act_your_account_id
```
- [ ] Added to `.env` file
- [ ] Added to Supabase dashboard (Settings → API → Environment Variables)

#### Test Connection
```bash
curl -G \
  -d "access_token=YOUR_TOKEN" \
  "https://graph.facebook.com/v18.0/act_YOUR_ACCOUNT_ID/insights"
```
- [ ] Returns data without errors

---

### YouTube Ads (Google Ads API)

#### Prerequisites
- [ ] Google Ads account exists
- [ ] Customer ID ready
- [ ] Google Cloud project created

#### Setup Steps
- [ ] Go to https://console.cloud.google.com
- [ ] Enable Google Ads API
- [ ] Create OAuth 2.0 credentials
- [ ] Configure consent screen
- [ ] Generate client ID and secret
- [ ] Authorize application
- [ ] Get refresh token

#### Environment Variables
```env
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=your_customer_id
```
- [ ] Added to `.env` file
- [ ] Added to Supabase dashboard

#### Test Connection
- [ ] Run test query using Google Ads API
- [ ] Verify data returns

---

### TikTok Ads API

#### Prerequisites
- [ ] TikTok Business account exists
- [ ] Advertiser account ID ready
- [ ] App created in TikTok for Developers

#### Setup Steps
- [ ] Go to https://ads.tiktok.com/marketing_api
- [ ] Create developer app
- [ ] Apply for API access
- [ ] Generate access token
- [ ] Get app ID and secret

#### Environment Variables
```env
TIKTOK_ACCESS_TOKEN=your_token_here
TIKTOK_APP_ID=your_app_id
TIKTOK_ADVERTISER_ID=your_advertiser_id
```
- [ ] Added to `.env` file
- [ ] Added to Supabase dashboard

#### Test Connection
```bash
curl -X GET \
  -H "Access-Token: YOUR_TOKEN" \
  "https://business-api.tiktok.com/open_api/v1.3/advertiser/info/"
```
- [ ] Returns advertiser data

---

## Phase 4: Data Sync Function ⏱️ 1-2 days

### Step 1: Create Edge Function
- [ ] Create folder: `supabase/functions/sync-ad-data`
- [ ] Create file: `index.ts`
- [ ] Copy sync code from documentation
- [ ] Install dependencies

### Step 2: Deploy Edge Function
```bash
supabase functions deploy sync-ad-data
```
- [ ] Deployment successful
- [ ] Function appears in Supabase dashboard

### Step 3: Test Manual Sync
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  "https://your-project.supabase.co/functions/v1/sync-ad-data"
```
- [ ] Function executes without errors
- [ ] Data appears in `ad_creatives` table
- [ ] Metrics are calculated correctly

### Step 4: Schedule Automated Sync
```sql
SELECT cron.schedule(
  'sync-ad-data-hourly',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/sync-ad-data',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```
- [ ] Cron job created
- [ ] Verify job runs every hour
- [ ] Check logs for errors

---

## Phase 5: Update Frontend ⏱️ 4 hours

### Step 1: Update TrafficControl.tsx

Replace mock data sections:

```typescript
// OLD - Mock data
const mockCreatives: Creative[] = [ ... ];

// NEW - Fetch from database
const [creatives, setCreatives] = useState<Creative[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchCreatives() {
    const { data, error } = await supabase
      .from('ad_creatives')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCreatives(data);
    setLoading(false);
  }
  
  fetchCreatives();
}, []);
```

- [ ] Replace mockCreatives with database query
- [ ] Replace mockAdManagers with database query
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with real data

### Step 2: Add Real-Time Updates (Optional)
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('ad_creatives_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'ad_creatives' },
      (payload) => {
        // Refresh data
        fetchCreatives();
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```
- [ ] Real-time subscription added
- [ ] Dashboard updates automatically

---

## Phase 6: Testing ⏱️ 1 day

### Unit Tests
- [ ] Test metric calculations (ROI, ROAS, etc.)
- [ ] Test filtering functions
- [ ] Test data aggregation
- [ ] All tests pass

### Integration Tests
- [ ] Test API connections
- [ ] Test database queries
- [ ] Test RLS policies
- [ ] Test sync function

### User Acceptance Testing
- [ ] Admin can access dashboard
- [ ] Sales role can access dashboard
- [ ] Student role CANNOT access (should redirect)
- [ ] All charts display correctly
- [ ] Filters work as expected
- [ ] Export functionality works
- [ ] Mobile responsive

### Performance Tests
- [ ] Dashboard loads in < 3 seconds
- [ ] Charts render smoothly
- [ ] No console errors
- [ ] No memory leaks

---

## Phase 7: Deployment ⏱️ 2-4 hours

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Team trained on new system

### Deployment Steps
- [ ] Commit all changes to git
- [ ] Create production branch
- [ ] Deploy to Vercel/Netlify
- [ ] Verify environment variables are set
- [ ] Run production build
- [ ] Test production URL

### Post-Deployment
- [ ] Monitor error logs (first 24 hours)
- [ ] Verify data sync is working
- [ ] Check all dashboards load
- [ ] Confirm metrics are accurate
- [ ] Collect user feedback

---

## Phase 8: Monitoring & Maintenance ⏱️ Ongoing

### Daily Checks
- [ ] Verify data sync ran successfully
- [ ] Check for API errors
- [ ] Monitor database size
- [ ] Review performance metrics

### Weekly Tasks
- [ ] Analyze dashboard usage
- [ ] Review team feedback
- [ ] Check for data anomalies
- [ ] Update documentation as needed

### Monthly Tasks
- [ ] Review API costs
- [ ] Optimize slow queries
- [ ] Archive old data
- [ ] Update API tokens if needed

---

## Troubleshooting Common Issues

### Issue: No data showing in dashboard
**Solution:**
1. Check if sync function ran: `SELECT * FROM ad_creatives;`
2. Check Edge Function logs in Supabase
3. Verify API tokens are valid
4. Test API connection manually

### Issue: RLS blocking queries
**Solution:**
1. Verify user role: `SELECT role FROM users WHERE id = auth.uid();`
2. Check RLS policies are applied correctly
3. Ensure user is logged in
4. Test query as admin user

### Issue: Metrics not calculating
**Solution:**
1. Check trigger function exists: `\df update_creative_metrics`
2. Verify trigger is attached to table
3. Manually update a record to test
4. Check for division by zero errors

### Issue: Slow dashboard loading
**Solution:**
1. Add indexes on frequently queried columns
2. Implement pagination for large datasets
3. Cache aggregated metrics
4. Optimize chart rendering

---

## Success Criteria

✅ **Database**
- All tables created and indexed
- RLS policies active and tested
- Sample data validates correctly

✅ **API Integration**
- All 3 platforms connected
- Data syncing every hour
- Error handling in place

✅ **Dashboard**
- Real data displaying correctly
- All metrics calculating accurately
- Filters and tabs working
- Performance acceptable

✅ **Security**
- Only admin/sales can access
- API keys protected
- RLS enforcing permissions
- Audit logging enabled

✅ **Team**
- Training completed
- Documentation accessible
- Support process defined
- Feedback mechanism in place

---

## Emergency Rollback Plan

If critical issues occur:

1. **Disable Cron Job**
```sql
SELECT cron.unschedule('sync-ad-data-hourly');
```

2. **Revert to Mock Data**
- Comment out database queries
- Uncomment mock data in TrafficControl.tsx
- Redeploy frontend

3. **Investigate Issue**
- Review error logs
- Check API status
- Verify database integrity

4. **Fix and Redeploy**
- Implement fix
- Test thoroughly
- Redeploy with monitoring

---

## Resources

- **Documentation**: All `.md` files in project root
- **Database Schema**: `DATABASE_TRAFFIC_CONTROL.sql`
- **API Docs**:
  - Facebook: https://developers.facebook.com/docs/marketing-apis
  - Google: https://developers.google.com/google-ads/api
  - TikTok: https://ads.tiktok.com/marketing_api/docs
- **Supabase**: https://supabase.com/docs

---

## Contact & Support

- **Technical Issues**: [Your dev team contact]
- **API Questions**: [Platform support links]
- **Business Questions**: [Management contact]

---

**Good luck with your launch! 🚀**

Remember: Start with small tests, validate each phase, and don't rush to production.
