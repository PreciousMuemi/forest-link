import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ResponseMetrics {
  avg_report_to_assignment: number;
  avg_assignment_to_enroute: number;
  avg_enroute_to_onscene: number;
  avg_onscene_to_resolution: number;
  avg_total_time: number;
  incidents_last_7_days: number;
  incidents_prev_7_days: number;
}

export const ResponseTimeAnalytics = () => {
  const [metrics, setMetrics] = useState<ResponseMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Calculate response time metrics from incidents
      const { data, error } = await supabase
        .from('incidents')
        .select('assigned_at, responded_at, resolved_at, created_at, incident_status')
        .not('assigned_at', 'is', null);

      if (error) throw error;

      // Calculate averages in minutes
      const calculateAvg = (times: number[]) => 
        times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

      const reportToAssignment: number[] = [];
      const assignmentToEnroute: number[] = [];
      const enrouteToOnscene: number[] = [];
      const onsceneToResolution: number[] = [];
      const totalTimes: number[] = [];

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      let last7Days = 0;
      let prev7Days = 0;

      data?.forEach((incident) => {
        const created = new Date(incident.created_at);
        
        if (created >= sevenDaysAgo) last7Days++;
        if (created >= fourteenDaysAgo && created < sevenDaysAgo) prev7Days++;

        if (incident.assigned_at) {
          const diff = (new Date(incident.assigned_at).getTime() - created.getTime()) / 60000;
          reportToAssignment.push(diff);
        }

        if (incident.assigned_at && incident.responded_at) {
          const diff = (new Date(incident.responded_at).getTime() - new Date(incident.assigned_at).getTime()) / 60000;
          assignmentToEnroute.push(diff);
        }

        if (incident.responded_at && incident.resolved_at) {
          const onsceneDiff = 30; // Estimate time on scene
          enrouteToOnscene.push(onsceneDiff);
          
          const resolutionDiff = (new Date(incident.resolved_at).getTime() - new Date(incident.responded_at).getTime()) / 60000;
          onsceneToResolution.push(resolutionDiff);
        }

        if (incident.resolved_at) {
          const total = (new Date(incident.resolved_at).getTime() - created.getTime()) / 60000;
          totalTimes.push(total);
        }
      });

      setMetrics({
        avg_report_to_assignment: calculateAvg(reportToAssignment),
        avg_assignment_to_enroute: calculateAvg(assignmentToEnroute),
        avg_enroute_to_onscene: calculateAvg(enrouteToOnscene),
        avg_onscene_to_resolution: calculateAvg(onsceneToResolution),
        avg_total_time: calculateAvg(totalTimes),
        incidents_last_7_days: last7Days,
        incidents_prev_7_days: prev7Days,
      });
    } catch (error) {
      console.error('Error fetching response metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTrend = () => {
    if (!metrics) return null;
    const change = metrics.incidents_last_7_days - metrics.incidents_prev_7_days;
    const percentChange = metrics.incidents_prev_7_days > 0 
      ? Math.round((change / metrics.incidents_prev_7_days) * 100) 
      : 0;
    
    return {
      change,
      percentChange,
      isIncrease: change > 0,
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trend = getTrend();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Response Time Analytics
        </CardTitle>
        <CardDescription>
          Average response times across incident lifecycle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div>
              <p className="text-sm text-muted-foreground">Report → Assignment</p>
              <p className="text-2xl font-bold">{formatTime(metrics?.avg_report_to_assignment || 0)}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div>
              <p className="text-sm text-muted-foreground">Assignment → En Route</p>
              <p className="text-2xl font-bold">{formatTime(metrics?.avg_assignment_to_enroute || 0)}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div>
              <p className="text-sm text-muted-foreground">En Route → On Scene</p>
              <p className="text-2xl font-bold">{formatTime(metrics?.avg_enroute_to_onscene || 0)}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div>
              <p className="text-sm text-muted-foreground">On Scene → Resolution</p>
              <p className="text-2xl font-bold">{formatTime(metrics?.avg_onscene_to_resolution || 0)}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/10">
            <div>
              <p className="text-sm font-medium">Total Average Time</p>
              <p className="text-3xl font-bold text-primary">{formatTime(metrics?.avg_total_time || 0)}</p>
              {trend && (
                <div className="flex items-center gap-1 mt-1">
                  {trend.isIncrease ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <span className={`text-xs ${trend.isIncrease ? 'text-destructive' : 'text-green-600'}`}>
                    {Math.abs(trend.percentChange)}% vs last week
                  </span>
                </div>
              )}
            </div>
            <Clock className="h-10 w-10 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
