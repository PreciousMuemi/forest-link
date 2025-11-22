import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, RefreshCw, Satellite } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ThreatMap from '@/components/ThreatMap';
import SatelliteMap from '@/components/SatelliteMap';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFetchingSatellite, setIsFetchingSatellite] = useState(false);

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
      <div className="p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Live Threat Map</h2>
          <p className="text-muted-foreground">Real-time forest incident monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleFetchSatelliteData}
            size="sm"
            variant="outline"
            disabled={isFetchingSatellite}
          >
            <Satellite className="h-4 w-4 mr-2" />
            {isFetchingSatellite ? 'Fetching...' : 'Fetch Satellite Data'}
          </Button>
          <Button onClick={fetchDashboardData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
          title="Critical Threats"
          value={stats?.critical_incidents || 0}
          icon={AlertCircle}
          description="Requires immediate attention"
        />
      </div>

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
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Source:</span>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px]">
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

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Severity:</span>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
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

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
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

      <Card>
        <CardContent className="p-0">
          <ThreatMap incidents={incidents} />
        </CardContent>
      </Card>

      {/* NASA Satellite Monitoring */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>NASA Satellite Fire Detection</CardTitle>
              <CardDescription>Real-time fire hotspot detection from NASA FIRMS</CardDescription>
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
