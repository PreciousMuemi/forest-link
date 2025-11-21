import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { ThreatChart } from '@/components/ThreatChart';
import { IncidentTable } from '@/components/IncidentTable';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats');

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch recent incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (incidentsError) throw incidentsError;
      setIncidents(incidentsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csv = [
        ['ID', 'Type', 'Severity', 'Latitude', 'Longitude', 'Date', 'Verified', 'Description'].join(','),
        ...incidents.map(i => [
          i.id,
          i.threat_type,
          i.severity,
          i.lat,
          i.lon,
          new Date(i.timestamp).toISOString(),
          i.verified ? 'Yes' : 'No',
          i.description || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forest-incidents-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor and manage forest threat reports
              </p>
            </div>
          </div>
          <Button onClick={handleExport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid gap-6 md:grid-cols-2">
              <ThreatChart
                data={stats?.by_threat_type || {}}
                title="Incidents by Type"
                description="Distribution of threat types"
                type="pie"
              />
              <ThreatChart
                data={stats?.by_severity || {}}
                title="Incidents by Severity"
                description="Severity level breakdown"
                type="bar"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
              <IncidentTable incidents={incidents} onUpdate={fetchDashboardData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
