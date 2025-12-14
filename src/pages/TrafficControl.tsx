import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ShoppingCart,
  Eye,
  MousePointerClick,
  UserPlus,
  GraduationCap,
  BarChart3,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';

// Types for our CRM integration
interface Creative {
  id: number;
  name: string;
  platform: 'Facebook' | 'YouTube' | 'TikTok';
  adManager: string;
  status: 'active' | 'paused' | 'testing' | 'stopped';
  
  // Traffic metrics
  impressions: number;
  clicks: number;
  ctr: number;
  
  // Cost metrics
  adSpend: number;
  cpc: number;
  cpm: number;
  
  // Lead metrics (CRM integration)
  leads: number;
  cpl: number; // Cost per lead
  qualifiedLeads: number;
  
  // Sales metrics
  sales: number;
  revenue: number;
  cpa: number; // Cost per acquisition
  
  // Performance
  roi: number;
  roas: number; // Return on ad spend
  conversionRate: number;
  
  // Course specific
  courseName: string;
  coursePrice: number;
  
  // Funnel
  landingPageViews: number;
  applicationsFilled: number;
  callsScheduled: number;
  callsCompleted: number;
}

interface AdManager {
  id: number;
  name: string;
  avatar?: string;
  platforms: string[];
  
  // Campaigns
  activeCampaigns: number;
  totalCreatives: number;
  
  // Costs
  totalSpent: number;
  avgCPL: number;
  avgCPA: number;
  
  // Performance
  totalLeads: number;
  totalSales: number;
  totalRevenue: number;
  roi: number;
  
  // Status
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
}

interface SalesFunnelData {
  stage: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

// Mock data - replace with real API calls to your CRM
const mockCreatives: Creative[] = [
  {
    id: 1,
    name: 'FB Video Ad - Python Course Promo',
    platform: 'Facebook',
    adManager: 'Anna Smirnova',
    status: 'active',
    impressions: 125000,
    clicks: 4000,
    ctr: 3.2,
    adSpend: 5400,
    cpc: 1.35,
    cpm: 43.2,
    leads: 320,
    cpl: 16.88,
    qualifiedLeads: 245,
    sales: 28,
    revenue: 55860,
    cpa: 192.86,
    roi: 934,
    roas: 10.34,
    conversionRate: 8.75,
    courseName: 'Python для начинающих',
    coursePrice: 1995,
    landingPageViews: 3200,
    applicationsFilled: 420,
    callsScheduled: 315,
    callsCompleted: 285
  },
  {
    id: 2,
    name: 'YT Pre-roll - Digital Marketing',
    platform: 'YouTube',
    adManager: 'Ivan Petrov',
    status: 'active',
    impressions: 89000,
    clicks: 2490,
    ctr: 2.8,
    adSpend: 8900,
    cpc: 3.57,
    cpm: 100,
    leads: 198,
    cpl: 44.95,
    qualifiedLeads: 156,
    sales: 18,
    revenue: 53820,
    cpa: 494.44,
    roi: 505,
    roas: 6.05,
    conversionRate: 9.09,
    courseName: 'Digital Marketing PRO',
    coursePrice: 2990,
    landingPageViews: 2100,
    applicationsFilled: 245,
    callsScheduled: 195,
    callsCompleted: 178
  },
  {
    id: 3,
    name: 'TikTok Viral - SMM Course',
    platform: 'TikTok',
    adManager: 'Maria Volkova',
    status: 'active',
    impressions: 245000,
    clicks: 12495,
    ctr: 5.1,
    adSpend: 3200,
    cpc: 0.26,
    cpm: 13.06,
    leads: 485,
    cpl: 6.60,
    qualifiedLeads: 398,
    sales: 52,
    revenue: 77948,
    cpa: 61.54,
    roi: 2336,
    roas: 24.36,
    conversionRate: 10.72,
    courseName: 'SMM-специалист 2024',
    coursePrice: 1499,
    landingPageViews: 9800,
    applicationsFilled: 620,
    callsScheduled: 480,
    callsCompleted: 445
  },
  {
    id: 4,
    name: 'FB Carousel - Web Dev Bootcamp',
    platform: 'Facebook',
    adManager: 'Dmitry Kozlov',
    status: 'testing',
    impressions: 67000,
    clicks: 2479,
    ctr: 3.7,
    adSpend: 6700,
    cpc: 2.70,
    cpm: 100,
    leads: 215,
    cpl: 31.16,
    qualifiedLeads: 178,
    sales: 15,
    revenue: 59850,
    cpa: 446.67,
    roi: 793,
    roas: 8.93,
    conversionRate: 6.98,
    courseName: 'Web Developer Bootcamp',
    coursePrice: 3990,
    landingPageViews: 2000,
    applicationsFilled: 280,
    callsScheduled: 210,
    callsCompleted: 192
  },
  {
    id: 5,
    name: 'TikTok Story - Copywriting',
    platform: 'TikTok',
    adManager: 'Maria Volkova',
    status: 'active',
    impressions: 178000,
    clicks: 7476,
    ctr: 4.2,
    adSpend: 4100,
    cpc: 0.55,
    cpm: 23.03,
    leads: 412,
    cpl: 9.95,
    qualifiedLeads: 345,
    sales: 38,
    revenue: 37924,
    cpa: 107.89,
    roi: 825,
    roas: 9.25,
    conversionRate: 9.22,
    courseName: 'Копирайтинг с нуля',
    coursePrice: 998,
    landingPageViews: 6200,
    applicationsFilled: 510,
    callsScheduled: 408,
    callsCompleted: 378
  },
  {
    id: 6,
    name: 'YT Video - Data Science',
    platform: 'YouTube',
    adManager: 'Ivan Petrov',
    status: 'paused',
    impressions: 45000,
    clicks: 1215,
    ctr: 2.7,
    adSpend: 5600,
    cpc: 4.61,
    cpm: 124.44,
    leads: 98,
    cpl: 57.14,
    qualifiedLeads: 72,
    sales: 8,
    revenue: 39920,
    cpa: 700,
    roi: 613,
    roas: 7.13,
    conversionRate: 8.16,
    courseName: 'Data Science & ML',
    coursePrice: 4990,
    landingPageViews: 980,
    applicationsFilled: 125,
    callsScheduled: 95,
    callsCompleted: 85
  }
];

const mockAdManagers: AdManager[] = [
  {
    id: 1,
    name: 'Anna Smirnova',
    platforms: ['Facebook'],
    activeCampaigns: 12,
    totalCreatives: 28,
    totalSpent: 45000,
    avgCPL: 18.50,
    avgCPA: 215.30,
    totalLeads: 2432,
    totalSales: 198,
    totalRevenue: 425860,
    roi: 846,
    performanceRating: 'excellent'
  },
  {
    id: 2,
    name: 'Ivan Petrov',
    platforms: ['YouTube'],
    activeCampaigns: 8,
    totalCreatives: 15,
    totalSpent: 38000,
    avgCPL: 45.20,
    avgCPA: 485.60,
    totalLeads: 841,
    totalSales: 78,
    totalRevenue: 298450,
    roi: 685,
    performanceRating: 'good'
  },
  {
    id: 3,
    name: 'Maria Volkova',
    platforms: ['TikTok'],
    activeCampaigns: 15,
    totalCreatives: 42,
    totalSpent: 32000,
    avgCPL: 8.80,
    avgCPA: 89.50,
    totalLeads: 3636,
    totalSales: 357,
    totalRevenue: 489520,
    roi: 1430,
    performanceRating: 'excellent'
  },
  {
    id: 4,
    name: 'Dmitry Kozlov',
    platforms: ['Facebook', 'Instagram'],
    activeCampaigns: 10,
    totalCreatives: 22,
    totalSpent: 28000,
    avgCPL: 28.40,
    avgCPA: 398.20,
    totalLeads: 986,
    totalSales: 70,
    totalRevenue: 272450,
    roi: 873,
    performanceRating: 'good'
  }
];

const monthlyTrendData = [
  { month: 'Jan', adSpend: 35000, revenue: 245000, leads: 1890, sales: 168 },
  { month: 'Feb', adSpend: 38000, revenue: 278000, leads: 2100, sales: 189 },
  { month: 'Mar', adSpend: 42000, revenue: 312000, leads: 2340, sales: 215 },
  { month: 'Apr', adSpend: 45000, revenue: 365000, leads: 2580, sales: 248 },
  { month: 'May', adSpend: 48000, revenue: 398000, leads: 2790, sales: 276 },
  { month: 'Jun', adSpend: 52000, revenue: 425000, leads: 2950, sales: 298 }
];

const platformDistribution = [
  { name: 'Facebook', value: 45, spend: 45000, revenue: 425860, color: '#3b5998' },
  { name: 'YouTube', value: 28, spend: 38000, revenue: 298450, color: '#FF0000' },
  { name: 'TikTok', value: 27, spend: 32000, revenue: 489520, color: '#000000' }
];

export default function TrafficControl() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedManager, setSelectedManager] = useState<number | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Calculate aggregated metrics
  const metrics = useMemo(() => {
    let creatives = mockCreatives;
    
    if (selectedPlatform !== 'all') {
      creatives = creatives.filter(c => c.platform === selectedPlatform);
    }
    
    const totalSpent = creatives.reduce((sum, c) => sum + c.adSpend, 0);
    const totalRevenue = creatives.reduce((sum, c) => sum + c.revenue, 0);
    const totalLeads = creatives.reduce((sum, c) => sum + c.leads, 0);
    const totalSales = creatives.reduce((sum, c) => sum + c.sales, 0);
    const totalImpressions = creatives.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = creatives.reduce((sum, c) => sum + c.clicks, 0);
    
    const avgCPL = totalLeads > 0 ? totalSpent / totalLeads : 0;
    const avgCPA = totalSales > 0 ? totalSpent / totalSales : 0;
    const avgROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent * 100) : 0;
    const avgROAS = totalSpent > 0 ? totalRevenue / totalSpent : 0;
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
    const overallConversionRate = totalLeads > 0 ? (totalSales / totalLeads * 100) : 0;
    
    return {
      totalSpent,
      totalRevenue,
      totalLeads,
      totalSales,
      totalImpressions,
      totalClicks,
      avgCPL,
      avgCPA,
      avgROI,
      avgROAS,
      avgCTR,
      overallConversionRate
    };
  }, [selectedPlatform]);

  // Calculate funnel data
  const funnelData: SalesFunnelData[] = useMemo(() => {
    const totalImpressions = mockCreatives.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = mockCreatives.reduce((sum, c) => sum + c.clicks, 0);
    const totalLandingViews = mockCreatives.reduce((sum, c) => sum + c.landingPageViews, 0);
    const totalApplications = mockCreatives.reduce((sum, c) => sum + c.applicationsFilled, 0);
    const totalCallsScheduled = mockCreatives.reduce((sum, c) => sum + c.callsScheduled, 0);
    const totalCallsCompleted = mockCreatives.reduce((sum, c) => sum + c.callsCompleted, 0);
    const totalSales = mockCreatives.reduce((sum, c) => sum + c.sales, 0);
    
    return [
      {
        stage: 'Impressions',
        count: totalImpressions,
        conversionRate: 100,
        dropoffRate: 0
      },
      {
        stage: 'Clicks',
        count: totalClicks,
        conversionRate: (totalClicks / totalImpressions) * 100,
        dropoffRate: ((totalImpressions - totalClicks) / totalImpressions) * 100
      },
      {
        stage: 'Landing Page',
        count: totalLandingViews,
        conversionRate: (totalLandingViews / totalClicks) * 100,
        dropoffRate: ((totalClicks - totalLandingViews) / totalClicks) * 100
      },
      {
        stage: 'Applications',
        count: totalApplications,
        conversionRate: (totalApplications / totalLandingViews) * 100,
        dropoffRate: ((totalLandingViews - totalApplications) / totalLandingViews) * 100
      },
      {
        stage: 'Calls Scheduled',
        count: totalCallsScheduled,
        conversionRate: (totalCallsScheduled / totalApplications) * 100,
        dropoffRate: ((totalApplications - totalCallsScheduled) / totalApplications) * 100
      },
      {
        stage: 'Calls Completed',
        count: totalCallsCompleted,
        conversionRate: (totalCallsCompleted / totalCallsScheduled) * 100,
        dropoffRate: ((totalCallsScheduled - totalCallsCompleted) / totalCallsScheduled) * 100
      },
      {
        stage: 'Sales',
        count: totalSales,
        conversionRate: (totalSales / totalCallsCompleted) * 100,
        dropoffRate: ((totalCallsCompleted - totalSales) / totalCallsCompleted) * 100
      }
    ];
  }, []);

  const getStatusBadge = (status: Creative['status']) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      testing: 'outline',
      stopped: 'destructive'
    };
    return <Badge variant={variants[status] as any}>{status.toUpperCase()}</Badge>;
  };

  const getPerformanceColor = (roi: number) => {
    if (roi >= 500) return 'text-green-600';
    if (roi >= 300) return 'text-blue-600';
    if (roi >= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: AdManager['performanceRating']) => {
    const config = {
      excellent: { color: 'bg-green-100 text-green-700', label: 'Excellent' },
      good: { color: 'bg-blue-100 text-blue-700', label: 'Good' },
      average: { color: 'bg-yellow-100 text-yellow-700', label: 'Average' },
      poor: { color: 'bg-red-100 text-red-700', label: 'Poor' }
    };
    const { color, label } = config[rating];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Traffic Control & CRM Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Cold Traffic Performance | Course Sales Funnel | Ad Manager Analytics
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync CRM
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Period & Platform Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['day', 'week', 'month', 'quarter', 'year'] as const).map((period) => (
                  <Button 
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlatform('all')}
                >
                  All Platforms
                </Button>
                <Button 
                  variant={selectedPlatform === 'Facebook' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlatform('Facebook')}
                >
                  Facebook
                </Button>
                <Button 
                  variant={selectedPlatform === 'YouTube' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlatform('YouTube')}
                >
                  YouTube
                </Button>
                <Button 
                  variant={selectedPlatform === 'TikTok' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlatform('TikTok')}
                >
                  TikTok
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Ad Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalSpent.toLocaleString()}</div>
              <p className="text-red-100 text-xs mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.5% vs last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
              <p className="text-green-100 text-xs mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +18.2% vs last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalLeads.toLocaleString()}</div>
              <p className="text-blue-100 text-xs mt-1">
                CPL: ${metrics.avgCPL.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Course Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSales}</div>
              <p className="text-purple-100 text-xs mt-1">
                CPA: ${metrics.avgCPA.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgROI.toFixed(1)}%</div>
              <p className="text-orange-100 text-xs mt-1">
                ROAS: {metrics.avgROAS.toFixed(2)}x
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overallConversionRate.toFixed(1)}%</div>
              <p className="text-pink-100 text-xs mt-1">
                CTR: {metrics.avgCTR.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="creatives">Creatives</TabsTrigger>
            <TabsTrigger value="funnel">Sales Funnel</TabsTrigger>
            <TabsTrigger value="managers">Ad Managers</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Ad Spend Trend</CardTitle>
                  <CardDescription>6-month performance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="adSpend" fill="#ef4444" name="Ad Spend" />
                      <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} name="Revenue" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>Budget allocation & returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {platformDistribution.map((platform) => (
                      <div key={platform.name} className="flex justify-between text-sm">
                        <span className="font-medium">{platform.name}</span>
                        <div className="flex gap-4">
                          <span className="text-red-600">-${platform.spend.toLocaleString()}</span>
                          <span className="text-green-600">+${platform.revenue.toLocaleString()}</span>
                          <span className="text-purple-600 font-semibold">
                            {((platform.revenue / platform.spend - 1) * 100).toFixed(0)}% ROI
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lead Generation & Sales Performance</CardTitle>
                <CardDescription>Monthly trends across all platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="leads" fill="#3b82f6" name="Leads" />
                    <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} name="Sales" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creatives Performance Tab */}
          <TabsContent value="creatives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creative Performance Dashboard</CardTitle>
                <CardDescription>Detailed metrics for each advertising creative</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Creative</th>
                        <th className="text-left py-3 px-4 font-semibold">Course</th>
                        <th className="text-center py-3 px-4 font-semibold">Status</th>
                        <th className="text-right py-3 px-4 font-semibold">Traffic</th>
                        <th className="text-right py-3 px-4 font-semibold">Leads</th>
                        <th className="text-right py-3 px-4 font-semibold">Sales</th>
                        <th className="text-right py-3 px-4 font-semibold">Ad Spend</th>
                        <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                        <th className="text-right py-3 px-4 font-semibold">ROI</th>
                        <th className="text-right py-3 px-4 font-semibold">Conv %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCreatives.map((creative) => (
                        <tr key={creative.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-sm">{creative.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  creative.platform === 'Facebook' ? 'bg-blue-100 text-blue-700' :
                                  creative.platform === 'YouTube' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {creative.platform}
                                </span>
                                <span className="text-xs text-gray-500">{creative.adManager}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="font-medium">{creative.courseName}</div>
                              <div className="text-gray-500">${creative.coursePrice}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {getStatusBadge(creative.status)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm">
                              <div className="font-medium">{creative.impressions.toLocaleString()}</div>
                              <div className="text-gray-500">{creative.clicks.toLocaleString()} clicks</div>
                              <div className="text-xs text-blue-600">{creative.ctr.toFixed(2)}% CTR</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm">
                              <div className="font-bold text-blue-600">{creative.leads}</div>
                              <div className="text-xs text-gray-500">${creative.cpl.toFixed(2)} CPL</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-sm">
                              <div className="font-bold text-purple-600">{creative.sales}</div>
                              <div className="text-xs text-gray-500">${creative.cpa.toFixed(2)} CPA</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="font-semibold text-red-600">
                              ${creative.adSpend.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              ${creative.cpc.toFixed(2)} CPC
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="font-semibold text-green-600">
                              ${creative.revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {creative.roas.toFixed(2)}x ROAS
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className={`font-bold text-lg ${getPerformanceColor(creative.roi)}`}>
                              {creative.roi}%
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="font-semibold">
                              {creative.conversionRate.toFixed(2)}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Creatives by ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[...mockCreatives].sort((a, b) => b.roi - a.roi).slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="roi" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Creative</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[...mockCreatives].sort((a, b) => b.revenue - a.revenue)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Funnel Tab */}
          <TabsContent value="funnel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Course Sales Funnel Analysis
                </CardTitle>
                <CardDescription>From impression to sale - complete conversion journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{stage.stage}</div>
                            <div className="text-sm text-gray-500">
                              {stage.count.toLocaleString()} users
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-blue-600">
                            {stage.conversionRate.toFixed(2)}%
                          </div>
                          {index > 0 && (
                            <div className="text-sm text-red-500">
                              -{stage.dropoffRate.toFixed(1)}% dropoff
                            </div>
                          )}
                        </div>
                      </div>
                      <Progress value={stage.conversionRate} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funnel Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rates by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={funnelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="conversionRate" stroke="#8b5cf6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Funnel Optimization Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Biggest Dropoff</div>
                    <div className="text-xl font-bold text-red-600">Landing → Application</div>
                    <div className="text-sm mt-1">
                      {funnelData[3]?.dropoffRate.toFixed(1)}% users lost
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Best Performing Stage</div>
                    <div className="text-xl font-bold text-green-600">Calls → Sales</div>
                    <div className="text-sm mt-1">
                      {funnelData[6]?.conversionRate.toFixed(1)}% close rate
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Overall Funnel Efficiency</div>
                    <div className="text-xl font-bold text-purple-600">
                      {((funnelData[6]?.count / funnelData[0]?.count) * 100).toFixed(3)}%
                    </div>
                    <div className="text-sm mt-1">Impression to sale</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Managers Tab */}
          <TabsContent value="managers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockAdManagers.map((manager) => (
                <Card 
                  key={manager.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedManager === manager.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedManager(selectedManager === manager.id ? null : manager.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                          {manager.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <CardTitle>{manager.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {manager.platforms.join(', ')}
                          </CardDescription>
                        </div>
                      </div>
                      {getRatingBadge(manager.performanceRating)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Active Campaigns</div>
                        <div className="text-2xl font-bold">{manager.activeCampaigns}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Creatives</div>
                        <div className="text-2xl font-bold">{manager.totalCreatives}</div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="font-bold text-red-600">${manager.totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <span className="font-bold text-green-600">${manager.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Leads Generated</span>
                        <span className="font-bold text-blue-600">{manager.totalLeads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Course Sales</span>
                        <span className="font-bold text-purple-600">{manager.totalSales}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-semibold">ROI</span>
                        <span className={`font-bold text-xl ${getPerformanceColor(manager.roi)}`}>
                          {manager.roi}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Avg CPL</div>
                        <div className="text-lg font-bold text-blue-600">${manager.avgCPL.toFixed(2)}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Avg CPA</div>
                        <div className="text-lg font-bold text-purple-600">${manager.avgCPA.toFixed(2)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ad Manager Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={mockAdManagers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSpent" fill="#ef4444" name="Ad Spend" />
                    <Bar dataKey="totalRevenue" fill="#22c55e" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Comparison by Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAdManagers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="roi" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Spend Trends</CardTitle>
                <CardDescription>6-month historical analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="adSpend" fill="#ef4444" stroke="#dc2626" fillOpacity={0.6} name="Ad Spend" />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} name="Revenue" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Generation Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">+73.5%</div>
                    <div className="text-xs text-gray-500 mt-1">vs Jan</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Lead Growth</span>
                      <ArrowUpRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">+56.1%</div>
                    <div className="text-xs text-gray-500 mt-1">vs Jan</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Sales Growth</span>
                      <ArrowUpRight className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">+77.4%</div>
                    <div className="text-xs text-gray-500 mt-1">vs Jan</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Ad Spend Increase</span>
                      <ArrowUpRight className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">+48.6%</div>
                    <div className="text-xs text-gray-500 mt-1">vs Jan</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
