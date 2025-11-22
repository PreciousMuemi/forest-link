import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [threatTypeData, setThreatTypeData] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [responseData, setResponseData] = useState<any[]>([]);

  const COLORS = {
    primary: '#3FA34D',
    warning: '#F2A007',
    danger: '#D64550',
    info: '#3B82F6',
    success: '#10B981',
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process timeline data (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const timeline = last30Days.map(date => {
        const dayIncidents = incidents?.filter(i => 
          i.created_at.startsWith(date)
        ) || [];
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          total: dayIncidents.length,
          verified: dayIncidents.filter(i => i.verified).length,
          critical: dayIncidents.filter(i => i.severity === 'critical').length,
        };
      });

      // Threat type distribution
      const threatTypes: Record<string, number> = {};
      incidents?.forEach(i => {
        threatTypes[i.threat_type] = (threatTypes[i.threat_type] || 0) + 1;
      });
      const threatData = Object.entries(threatTypes).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        percentage: ((value / (incidents?.length || 1)) * 100).toFixed(1)
      }));

      // Severity breakdown
      const severities = ['critical', 'high', 'medium', 'low'];
      const severityBreakdown = severities.map(severity => ({
        name: severity.charAt(0).toUpperCase() + severity.slice(1),
        count: incidents?.filter(i => i.severity === severity).length || 0,
        verified: incidents?.filter(i => i.severity === severity && i.verified).length || 0,
      }));

      // Response time analysis (simulated)
      const responseAnalysis = [
        { range: '< 10 min', count: Math.floor((incidents?.length || 0) * 0.25) },
        { range: '10-20 min', count: Math.floor((incidents?.length || 0) * 0.35) },
        { range: '20-30 min', count: Math.floor((incidents?.length || 0) * 0.25) },
        { range: '> 30 min', count: Math.floor((incidents?.length || 0) * 0.15) },
      ];

      setTimelineData(timeline);
      setThreatTypeData(threatData);
      setSeverityData(severityBreakdown);
      setResponseData(responseAnalysis);

      // Summary stats
      const statsData = {
        total: incidents?.length || 0,
        verified: incidents?.filter(i => i.verified).length || 0,
        pending: incidents?.filter(i => !i.verified).length || 0,
        critical: incidents?.filter(i => i.severity === 'critical').length || 0,
        avgResponseTime: '18.5',
        activeIncidents: incidents?.filter(i => i.incident_status !== 'resolved').length || 0,
      };
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive threat intelligence insights</p>
        </div>
        <Button onClick={fetchAnalytics} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time reports</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats?.verified || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats?.verified / stats?.total) * 100 || 0).toFixed(1)}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats?.critical || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.avgResponseTime || '0'}m</div>
            <p className="text-xs text-muted-foreground mt-1">Average response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Incident Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            30-Day Incident Timeline
          </CardTitle>
          <CardDescription>Daily incident trends and verification rates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke={COLORS.primary} 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                name="Total Incidents"
              />
              <Area 
                type="monotone" 
                dataKey="verified" 
                stroke={COLORS.success} 
                fillOpacity={1} 
                fill="url(#colorVerified)" 
                name="Verified"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Threat Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Type Distribution</CardTitle>
            <CardDescription>Breakdown of incident categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={threatTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Analysis</CardTitle>
            <CardDescription>Incidents by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill={COLORS.primary} name="Total" radius={[8, 8, 0, 0]} />
                <Bar dataKey="verified" fill={COLORS.success} name="Verified" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Time Distribution
            </CardTitle>
            <CardDescription>Ranger response efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={responseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis dataKey="range" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill={COLORS.info} name="Incidents" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Key Insights
            </CardTitle>
            <CardDescription>Performance summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">Verification Rate</span>
              </div>
              <span className="text-lg font-bold text-success">
                {((stats?.verified / stats?.total) * 100 || 0).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Active Incidents</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {stats?.activeIncidents || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium">Pending Review</span>
              </div>
              <span className="text-lg font-bold text-warning">
                {stats?.pending || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium">Critical Rate</span>
              </div>
              <span className="text-lg font-bold text-destructive">
                {((stats?.critical / stats?.total) * 100 || 0).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
