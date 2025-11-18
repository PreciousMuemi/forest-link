import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame, TreePine } from 'lucide-react';
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
      case 'critical':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      default:
        return 'muted';
    }
  };

  const getThreatIcon = (threatType: string) => {
    switch (threatType.toLowerCase()) {
      case 'fire':
        return <Flame className="h-4 w-4" />;
      case 'deforestation':
        return <TreePine className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Map placeholder - In production, integrate with Leaflet or Mapbox */}
      <Card className="lg:col-span-2 p-4 bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl">🗺️</div>
            <p className="text-muted-foreground">Map View</p>
            <p className="text-sm text-muted-foreground">
              Integrate Leaflet/Mapbox for production
            </p>
          </div>
        </div>
        
        {/* Incident markers overlay */}
        <div className="absolute inset-0 p-4">
          {incidents.slice(0, 5).map((incident, idx) => (
            <div
              key={incident.id}
              className="absolute bg-primary/20 border-2 border-primary rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform animate-pulse"
              style={{
                top: `${20 + idx * 15}%`,
                left: `${30 + idx * 10}%`,
              }}
              onClick={() => setSelectedIncident(incident)}
            >
              {getThreatIcon(incident.threat_type)}
            </div>
          ))}
        </div>
      </Card>

      {/* Incidents list */}
      <Card className="p-4 overflow-y-auto max-h-[600px]">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Active Threats ({incidents.length})
        </h3>
        
        <div className="space-y-3">
          {incidents.map((incident) => (
            <Card
              key={incident.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedIncident?.id === incident.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getThreatIcon(incident.threat_type)}
                  <span className="font-medium text-sm capitalize">
                    {incident.threat_type}
                  </span>
                </div>
                <Badge variant={getSeverityColor(incident.severity) as any}>
                  {incident.severity}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {incident.description || 'No description'}
              </p>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <div>📍 {incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}</div>
                <div>🕐 {new Date(incident.timestamp).toLocaleString()}</div>
                {incident.tx_hash && (
                  <div className="truncate">
                    ⛓️ {incident.tx_hash.slice(0, 10)}...
                  </div>
                )}
                <div>
                  📢 Alert: <Badge variant="outline" className="ml-1 text-xs">
                    {incident.alert_status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
          
          {incidents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No threats detected
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ThreatMap;
