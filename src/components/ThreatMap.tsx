import { useEffect, useMemo, useState } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle,
  Flame,
  Leaf,
  MapPin,
  Navigation,
  Radio,
  Satellite,
  TreeDeciduous,
} from 'lucide-react';

type Incident = Tables<'incidents'>;

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const DEFAULT_VIEW_STATE = {
  latitude: -1.2921,
  longitude: 36.8219,
  zoom: 6,
};

const ThreatMap = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showSatelliteOnly, setShowSatelliteOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [viewport, setViewport] = useState(DEFAULT_VIEW_STATE);

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .not('lat', 'is', null)
        .not('lon', 'is', null)
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) {
        console.error('Error loading incidents:', error);
        toast.error('Failed to load map incidents');
        return;
      }

      setIncidents(data || []);
    };

    fetchIncidents();

    const channel = supabase
      .channel('threat-map-incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        () => fetchIncidents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (showSatelliteOnly && incident.source !== 'satellite') return false;
      if (showVerifiedOnly && !incident.verified) return false;
      return true;
    });
  }, [incidents, showSatelliteOnly, showVerifiedOnly]);

  const getMarkerColor = (incident: Incident) => {
    if (incident.incident_status === 'resolved') return '#22C55E';
    if (!incident.verified) return '#EAB308';
    if (['high', 'critical'].includes((incident.severity || '').toLowerCase())) return '#DC2626';
    return '#F97316';
  };

  const getIncidentDate = (incident: Incident) => {
    return incident.created_at || (incident as any).timestamp;
  };

  const renderThreatIcon = (incident: Incident) => {
    if (incident.source === 'satellite') return <Satellite className="h-4 w-4" />;
    if ((incident.threat_type || '').toLowerCase().includes('fire')) return <Flame className="h-4 w-4" />;
    if ((incident.threat_type || '').toLowerCase().includes('deforestation')) return <TreeDeciduous className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            Live incidents plotted from community reports, SMS, USSD, and NASA satellite detections.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="satellite-toggle" checked={showSatelliteOnly} onCheckedChange={setShowSatelliteOnly} />
            <Label htmlFor="satellite-toggle" className="text-sm">
              Satellite only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="verified-toggle" checked={showVerifiedOnly} onCheckedChange={setShowVerifiedOnly} />
            <Label htmlFor="verified-toggle" className="text-sm">
              Verified only
            </Label>
          </div>
        </div>
      </div>

      <div className="relative h-[520px] rounded-2xl overflow-hidden border border-border">
        <Map
          {...viewport}
          onMove={(evt) => setViewport(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />

          {filteredIncidents.map((incident) => (
            <Marker key={incident.id} latitude={incident.lat} longitude={incident.lon} anchor="bottom">
              <button
                onClick={() => setSelectedIncident(incident)}
                className="w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center"
                style={{ backgroundColor: getMarkerColor(incident) }}
                aria-label={`Open incident ${incident.threat_type}`}
              >
                {renderThreatIcon(incident)}
              </button>
            </Marker>
          ))}

          {selectedIncident && (
            <Popup
              latitude={selectedIncident.lat}
              longitude={selectedIncident.lon}
              anchor="top"
              closeOnClick={false}
              onClose={() => setSelectedIncident(null)}
              offset={30}
            >
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-xs"
                    variant={selectedIncident.verified ? 'default' : 'secondary'}
                  >
                    {selectedIncident.incident_status?.replace('_', ' ').toUpperCase() || 'REPORTED'}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedIncident.threat_type || 'Threat'}
                  </Badge>
                </div>
                <p className="font-semibold">{selectedIncident.severity || 'Unknown'} threat</p>
                <p className="text-muted-foreground">
                  {selectedIncident.description || 'No community description provided.'}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {selectedIncident.lat.toFixed(3)}, {selectedIncident.lon.toFixed(3)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Leaf className="h-3 w-3" />
                  {new Date(getIncidentDate(selectedIncident) || '').toLocaleString()}
                </div>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${selectedIncident.lat},${selectedIncident.lon}`,
                      '_blank'
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Navigation className="h-3 w-3" /> Navigate with Google Maps
                </button>
              </div>
            </Popup>
          )}

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 text-xs space-y-2">
            <div className="font-semibold text-muted-foreground">Legend</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-600" /> High / Critical
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" /> Pending Verification
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Resolved
              </div>
            </div>
          </div>
        </Map>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Incidents</p>
          <p className="text-2xl font-bold">{incidents.length}</p>
          <p className="text-xs text-muted-foreground">Since launch</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Live Satellite Detections</p>
          <p className="text-2xl font-bold">{incidents.filter((i) => i.source === 'satellite').length}</p>
          <p className="text-xs text-muted-foreground">NASA FIRMS / VIIRS feed</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Verified Community Reports</p>
          <p className="text-2xl font-bold">{incidents.filter((i) => i.verified).length}</p>
          <p className="text-xs text-muted-foreground">Approved by admin team</p>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filteredIncidents.slice(0, 6).map((incident) => (
          <Card
            key={incident.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedIncident(incident)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {renderThreatIcon(incident)}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{incident.threat_type || 'Threat report'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(getIncidentDate(incident) || '').toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {incident.description || 'No description provided by reporter.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={incident.verified ? 'default' : 'secondary'}
                    className="text-xs capitalize"
                  >
                    {incident.incident_status?.replace('_', ' ') || 'reported'}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {incident.severity || 'unknown'}
                  </Badge>
                  {incident.source && (
                    <Badge variant="outline" className="text-xs uppercase">
                      {incident.source}
                    </Badge>
                  )}
                </div>
              </div>
              <button
                className="text-primary text-sm font-semibold hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewport({ latitude: incident.lat, longitude: incident.lon, zoom: 9 });
                  setSelectedIncident(incident);
                }}
              >
                Focus
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ThreatMap;
