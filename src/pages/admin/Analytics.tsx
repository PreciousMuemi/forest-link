import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThreatChart } from '@/components/ThreatChart';
import { ResponseTimeAnalytics } from '@/components/ResponseTimeAnalytics';
import { RiskHeatMap } from '@/components/RiskHeatMap';
import { CommunityLeaderboard } from '@/components/CommunityLeaderboard';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [statsResponse, criticalResponse] = await Promise.all([
        supabase.rpc('get_dashboard_stats'),
        supabase
          .from('incidents')
          .select('*')
          .eq('severity', 'critical')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
      ]);

      if (statsResponse.error) throw statsResponse.error;
      if (criticalResponse.error) throw criticalResponse.error;

      setStats(statsResponse.data);
      setCriticalAlerts(criticalResponse.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics & Trends</h2>
          <p className="text-muted-foreground">Insights and performance metrics</p>
        </div>
        <Button onClick={fetchAnalytics} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Critical Alerts (Last 24 Hours)
          </CardTitle>
          <CardDescription>High-priority incidents requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {criticalAlerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No critical alerts in the last 24 hours</p>
          ) : (
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Critical</Badge>
                      <span className="font-medium">{alert.threat_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.description || 'No description'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(alert.created_at).toLocaleTimeString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.lat.toFixed(4)}, {alert.lon.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ResponseTimeAnalytics />
        <CommunityLeaderboard />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ML Model Accuracy
            </CardTitle>
            <CardDescription>Satellite detection performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Fire Detection</span>
                  <span className="text-sm text-muted-foreground">94.2%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '94.2%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Logging Detection</span>
                  <span className="text-sm text-muted-foreground">88.7%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '88.7%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Deforestation</span>
                  <span className="text-sm text-muted-foreground">91.5%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '91.5%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RiskHeatMap />
    </div>
  );
}
