import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, AlertCircle, Flame, TreeDeciduous, Satellite } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Incident = Tables<'incidents'>;

interface ThreatMapProps {
  incidents?: Incident[];
}

const ThreatMap = ({ incidents: externalIncidents }: ThreatMapProps = {}) => {
  const [incidents, setIncidents] = useState<Incident[]>(externalIncidents || []);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    // If external incidents provided, use them
    if (externalIncidents) {
      setIncidents(externalIncidents);
      return;
    }

    // Otherwise fetch incidents
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

    // Subscribe to real-time updates only if not using external incidents
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
          } else if (payload.eventType === 'DELETE') {
            setIncidents((prev) => prev.filter((inc) => inc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [externalIncidents]);

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
    if (source === 'satellite') {
      return <Satellite className="h-4 w-4" />;
    }
    
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

        {/* Incident markers - Simulated */}
        <div className="absolute inset-0 p-8">
          {incidents.slice(0, 10).map((incident, idx) => {
            const leftPercent = 20 + (idx * 7) % 70;
            const topPercent = 15 + (idx * 11) % 60;
            
            return (
              <button
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className="absolute w-6 h-6 rounded-full bg-destructive/80 border-2 border-background shadow-lg
                          hover:scale-125 transition-transform cursor-pointer flex items-center justify-center
                          animate-pulse"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                }}
              >
                {getThreatIcon(incident.threat_type, incident.source || undefined)}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2">
          <div className="text-xs font-medium">Threat Types</div>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-destructive" />
              Fire
            </div>
            <div className="flex items-center gap-1">
              <TreeDeciduous className="h-3 w-3 text-primary" />
              Deforestation
            </div>
            <div className="flex items-center gap-1">
              <Satellite className="h-3 w-3 text-accent" />
              Satellite
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Active Incidents</div>
          <div className="text-2xl font-bold">{incidents.length}</div>
        </div>
      </div>

      {/* Selected Incident Details */}
      {selectedIncident && (
        <Card className="animate-fade-in">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Badge>
                  <Badge variant="outline">
                    {getThreatIcon(selectedIncident.threat_type, selectedIncident.source || undefined)}
                    <span className="ml-1">{selectedIncident.threat_type}</span>
                  </Badge>
                  {selectedIncident.source && (
                    <Badge variant="secondary">
                      {selectedIncident.source}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold">Incident Details</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Location</div>
                <div className="flex items-center gap-1 font-medium">
                  <MapPin className="h-4 w-4" />
                  {selectedIncident.lat.toFixed(4)}, {selectedIncident.lon.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Reported</div>
                <div className="font-medium">
                  {new Date(selectedIncident.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium capitalize">
                  {selectedIncident.incident_status || 'reported'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Verified</div>
                <div className="font-medium">
                  {selectedIncident.verified ? '✓ Yes' : '✗ No'}
                </div>
              </div>
            </div>

            {selectedIncident.description && (
              <div>
                <div className="text-muted-foreground text-sm mb-1">Description</div>
                <p className="text-sm">{selectedIncident.description}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recent Incidents List */}
      <div className="grid gap-3">
        <h3 className="text-sm font-semibold">Recent Incidents</h3>
        {incidents.slice(0, 5).map((incident) => (
          <Card 
            key={incident.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedIncident(incident)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
                  {getThreatIcon(incident.threat_type, incident.source || undefined)}
                </div>
                <div>
                  <div className="font-medium">{incident.threat_type}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(incident.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
                {incident.source && (
                  <Badge variant="outline" className="text-xs">
                    {incident.source}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ThreatMap;
