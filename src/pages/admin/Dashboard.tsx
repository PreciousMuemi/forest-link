import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, RefreshCw, Satellite, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ThreatMap from '@/components/ThreatMap';
import SatelliteMap from '@/components/SatelliteMap';
import { NASAFireAlerts } from '@/components/NASAFireAlerts';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--success))', 'hsl(var(--warning))'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFetchingSatellite, setIsFetchingSatellite] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [sourceFilter, severityFilter, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats');
      if (statsError) throw statsError;
      setStats(statsData);

      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (sourceFilter !== 'all') query = query.eq('source', sourceFilter);
      if (severityFilter !== 'all') query = query.eq('severity', severityFilter);
      if (statusFilter !== 'all') query = query.eq('incident_status', statusFilter);

      const { data: incidentsData, error: incidentsError } = await query;
      if (incidentsError) throw incidentsError;
      setIncidents(incidentsData || []);

      // Generate time series data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const timeData = last7Days.map(date => {
        const dayIncidents = (incidentsData || []).filter((inc: any) => 
          inc.created_at.startsWith(date)
        );
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          incidents: dayIncidents.length,
          critical: dayIncidents.filter((i: any) => i.severity === 'critical').length,
          resolved: dayIncidents.filter((i: any) => i.incident_status === 'resolved').length,
        };
      });
      setTimeSeriesData(timeData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSatelliteData = async () => {
    try {
      setIsFetchingSatellite(true);
      toast.info('Fetching satellite fire hotspots from NASA FIRMS...');

      const { error } = await supabase.functions.invoke('fetch-satellite-hotspots');
      if (error) throw error;

      toast.success('Satellite data fetched successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      toast.error('Failed to fetch satellite data');
    } finally {
      setIsFetchingSatellite(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  // Prepare chart data
  const threatTypeData = Object.entries(stats?.by_threat_type || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number
  }));

  const severityData = Object.entries(stats?.by_severity || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
    fill: name === 'critical' ? 'hsl(var(--destructive))' : 
          name === 'high' ? 'hsl(var(--warning))' : 
          name === 'medium' ? 'hsl(var(--accent))' : 'hsl(var(--success))'
  }));

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Command Dashboard</h2>
          <p className="text-muted-foreground">Real-time forest threat intelligence</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            onClick={handleFetchSatelliteData}
            size="sm"
            variant="outline"
            disabled={isFetchingSatellite}
            className="flex-1 md:flex-initial"
          >
            <Satellite className="h-4 w-4 mr-2" />
            {isFetchingSatellite ? 'Fetching...' : 'NASA Data'}
          </Button>
          <Button onClick={fetchDashboardData} size="sm" className="flex-1 md:flex-initial">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard
          title="Total Incidents"
          value={stats?.total_incidents || 0}
          icon={AlertTriangle}
          description="All reported threats"
        />
        <StatsCard
          title="Verified"
          value={stats?.verified_incidents || 0}
          icon={CheckCircle}
          description="Confirmed by admins"
        />
        <StatsCard
          title="Pending Review"
          value={stats?.pending_incidents || 0}
          icon={Clock}
          description="Awaiting verification"
        />
        <StatsCard
          title="Critical"
          value={stats?.critical_incidents || 0}
          icon={AlertCircle}
          description="Immediate attention"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Incident Trend</CardTitle>
            <CardDescription>Daily incident reports and resolutions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="incidents" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" strokeWidth={2} name="Critical" />
                <Line type="monotone" dataKey="resolved" stroke="hsl(var(--success))" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat Type Distribution</CardTitle>
            <CardDescription>Breakdown by threat category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {threatTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Levels</CardTitle>
            <CardDescription>Incidents by severity classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Efficiency</CardTitle>
            <CardDescription>System performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Verification Rate
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats?.total_incidents > 0 
                    ? Math.round((stats.verified_incidents / stats.total_incidents) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all" 
                  style={{ 
                    width: `${stats?.total_incidents > 0 
                      ? (stats.verified_incidents / stats.total_incidents) * 100 
                      : 0}%` 
                  }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Today's Activity
                </span>
                <span className="text-sm text-muted-foreground">{stats?.incidents_today || 0} reports</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ 
                    width: `${Math.min(100, ((stats?.incidents_today || 0) / 10) * 100)}%` 
                  }} 
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                System processing {stats?.total_incidents || 0} total incidents across all regions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Filter Incidents</CardTitle>
              <CardDescription>Adjust filters to view specific threats</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm font-medium">Source:</span>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="pwa">📱 App</SelectItem>
                  <SelectItem value="sms">💬 SMS</SelectItem>
                  <SelectItem value="ussd">📞 USSD</SelectItem>
                  <SelectItem value="satellite">🛰️ Satellite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm font-medium">Severity:</span>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm font-medium">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="en_route">En Route</SelectItem>
                  <SelectItem value="on_scene">On Scene</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maps */}
      <Card>
        <CardContent className="p-0">
          <ThreatMap />
        </CardContent>
      </Card>

      <NASAFireAlerts />
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>NASA Satellite Fire Detection</CardTitle>
              <CardDescription>Interactive satellite hotspot visualization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SatelliteMap />
        </CardContent>
      </Card>
    </div>
  );
}
