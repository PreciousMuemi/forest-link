import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, AlertCircle, Flame, TreeDeciduous, Satellite } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Incident = Tables<'incidents'>;

const ThreatMap = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    // Fetch initial incidents
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching incidents:', error);
      } else {
        setIncidents(data || []);
      }
    };

    fetchIncidents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('incidents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'INSERT') {
            setIncidents((prev) => [payload.new as Incident, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncidents((prev) =>
              prev.map((inc) =>
                inc.id === payload.new.id ? (payload.new as Incident) : inc
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getThreatIcon = (threatType: string, source?: string) => {
    // Special icons for satellite sources
    if (source === 'satellite') {
      return <Satellite className="h-4 w-4" />;
    }
    
    // Regular threat type icons
    switch (threatType.toLowerCase()) {
      case 'fire':
        return <Flame className="h-4 w-4" />;
      case 'deforestation':
        return <TreeDeciduous className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Visualization */}
      <div className="relative h-[500px] bg-gradient-to-br from-secondary/30 via-accent/20 to-primary/10 rounded-2xl overflow-hidden border border-border shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(145,240,180,0.1),transparent_50%)]" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border max-w-md">
              <Satellite className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold mb-2">Satellite Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect Google Earth Engine or Sentinel Hub for real-time satellite imagery
              </p>
              <div className="space-y-2 text-xs text-left">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Sentinel-2 Imagery (10m resolution)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>MODIS Fire Detection</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Landsat Deforestation Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated incident markers */}
        {incidents.slice(0, 5).map((incident, idx) => {
          const isSatellite = incident.source === 'satellite';
          const isSMS = incident.source === 'sms';
          
          return (
            <div
              key={incident.id}
              className="absolute z-20 group"
              style={{
                left: `${15 + idx * 17}%`,
                top: `${25 + (idx % 2) * 30}%`,
              }}
            >
              <div className="relative">
                <div className={`absolute inset-0 rounded-full animate-ping ${
                  isSatellite ? 'bg-blue-500/30' : 
                  isSMS ? 'bg-green-500/30' : 
                  'bg-destructive/30'
                }`} />
                <div className={`relative p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer ${
                  isSatellite ? 'bg-blue-500 text-white' :
                  isSMS ? 'bg-green-500 text-white' :
                  'bg-destructive text-destructive-foreground'
                }`}>
                  {getThreatIcon(incident.threat_type, incident.source)}
                </div>
                <div className="absolute hidden group-hover:block bg-card p-3 rounded-xl shadow-xl -top-24 left-1/2 -translate-x-1/2 w-56 border border-border z-30">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{incident.threat_type}</p>
                    <p className="text-xs text-muted-foreground">
                      📍 {incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}
                    </p>
                    {incident.source && (
                      <p className="text-xs text-muted-foreground">
                        Source: {incident.source === 'satellite' ? '🛰️ Satellite' : 
                                 incident.source === 'sms' ? '💬 SMS' : 
                                 '📱 App'}
                      </p>
                    )}
                    <Badge variant={getSeverityColor(incident.severity)} className="text-xs">
                      {incident.severity} severity
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Threats List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Active Threats
          </h3>
          {incidents.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {incidents.length} detected
            </Badge>
          )}
        </div>
        
        <div className="grid gap-3">
          {incidents.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground space-y-2">
                <MapPin className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm font-medium">No active threats detected</p>
                <p className="text-xs">System is monitoring satellite feeds...</p>
              </div>
            </Card>
          ) : (
            incidents.map((incident) => (
              <Card
                key={incident.id}
                className="p-4 hover:shadow-md transition-all border-l-4 hover:border-l-primary"
                style={{
                  borderLeftColor: incident.severity === 'high' || incident.severity === 'critical' ? 'hsl(var(--destructive))' : 
                                   incident.severity === 'medium' ? 'hsl(var(--warning))' : 
                                   'hsl(var(--muted))'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      incident.severity === 'high' || incident.severity === 'critical' ? 'bg-destructive/10' : 
                      incident.severity === 'medium' ? 'bg-warning/10' : 
                      'bg-muted'
                    }`}>
                      {getThreatIcon(incident.threat_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm capitalize">{incident.threat_type}</p>
                        <Badge variant={getSeverityColor(incident.severity)} className="text-xs">
                          {incident.severity}
                        </Badge>
                        {incident.source && (
                          <Badge variant="outline" className="text-xs">
                            {incident.source === 'satellite' ? '🛰️' : 
                             incident.source === 'sms' ? '💬' : 
                             '📱'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        📍 Coordinates: {incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}
                      </p>
                      {incident.description && (
                        <p className="text-xs text-muted-foreground mt-1">{incident.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        🕐 {new Date(incident.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;
