import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, AlertTriangle, MapPin, RefreshCw, Satellite } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FireHotspot {
  id: string;
  threat_type: string;
  severity: string;
  lat: number;
  lon: number;
  timestamp: string;
  confidence?: number;
  brightness?: number;
  source: string;
}

export const NASAFireAlerts = () => {
  const [hotspots, setHotspots] = useState<FireHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('source', 'satellite')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHotspots(data || []);
    } catch (error) {
      console.error('Error fetching fire hotspots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNASAData = async () => {
    setFetching(true);
    try {
      toast.info('Fetching latest NASA FIRMS fire data...');
      
      const { data, error } = await supabase.functions.invoke('fetch-satellite-hotspots');

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || 'NASA fire data updated successfully');
        fetchHotspots();
      } else {
        toast.warning('No new fire hotspots detected');
      }
    } catch (error) {
      console.error('Error fetching NASA data:', error);
      toast.error('Failed to fetch NASA fire data. Using cached data.');
    } finally {
      setFetching(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-accent animate-pulse" />
            Loading NASA Fire Data...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              Latest Fire Alerts from NASA FIRMS
            </CardTitle>
            <CardDescription>Real-time satellite fire detection for Kenya</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchNASAData}
            disabled={fetching}
            className="gap-2 bg-gradient-accent border-accent/30"
          >
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hotspots.length === 0 ? (
          <div className="text-center py-12 bg-gradient-card rounded-lg border border-border">
            <Satellite className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">No Active Fire Hotspots</p>
            <p className="text-sm text-muted-foreground mb-4">
              No fire hotspots detected in the last 24 hours
            </p>
            <Button
              variant="outline"
              onClick={handleFetchNASAData}
              disabled={fetching}
              className="gap-2 bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
            >
              <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
              Fetch Latest Data
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="p-4 rounded-lg bg-gradient-card border border-border hover:shadow-glow-accent transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <Flame className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground">{hotspot.threat_type}</h4>
                        <Badge variant={getSeverityColor(hotspot.severity)}>
                          {hotspot.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {hotspot.lat.toFixed(4)}, {hotspot.lon.toFixed(4)}
                        </span>
                        <span>{new Date(hotspot.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1 bg-accent/10 border-accent/30 text-accent">
                    <Satellite className="h-3 w-3" />
                    NASA FIRMS
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
