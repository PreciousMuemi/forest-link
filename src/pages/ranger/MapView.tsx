import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import { MapPin, Navigation, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1haS1kZW1vIiwiYSI6ImNseTB5YmNqeTBhcXEyanM3YmRlbGU4bTcifQ.VVWgR_SN5iRiMlLbd-Bvbg';

interface Incident {
    id: string;
    threat_type: string;
    severity: string;
    lat: number;
    lon: number;
    description: string;
    created_at: string;
    incident_status: string;
    verified: boolean;
}

export default function RangerMapView() {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [viewport, setViewport] = useState({
        latitude: -1.2921,
        longitude: 36.8219,
        zoom: 10,
    });

    useEffect(() => {
        fetchIncidents();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('ranger-map-incidents')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'incidents',
                },
                () => {
                    fetchIncidents();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [showActiveOnly]);

    const fetchIncidents = async () => {
        try {
            let query = supabase
                .from('incidents')
                .select('*')
                .or('assigned_ranger.eq.ranger,region.eq.demo');

            if (showActiveOnly) {
                query = query.neq('incident_status', 'resolved');
            }

            const { data, error } = await query;

            if (error) throw error;

            setIncidents(data || []);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast.error('Failed to load incidents');
        }
    };

    const getMarkerColor = (incident: Incident) => {
        if (incident.incident_status === 'resolved') {
            return '#22C55E'; // green
        }
        if (!incident.verified) {
            return '#EAB308'; // yellow
        }
        if (incident.severity === 'high' || incident.severity === 'critical') {
            return '#DC2626'; // red
        }
        return '#F97316'; // orange
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="active-only"
                                checked={showActiveOnly}
                                onCheckedChange={setShowActiveOnly}
                            />
                            <Label htmlFor="active-only">Show Active Only</Label>
                        </div>
                        <Badge variant="outline">{incidents.length} incidents</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-600" />
                            <span>High Severity</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span>Unverified</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Resolved</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Map */}
            <Card className="overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
                <Map
                    {...viewport}
                    onMove={(evt) => setViewport(evt.viewState)}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                >
                    {incidents.map((incident) => (
                        <Marker
                            key={incident.id}
                            latitude={incident.lat}
                            longitude={incident.lon}
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setSelectedIncident(incident);
                            }}
                        >
                            <div
                                className="cursor-pointer transform hover:scale-110 transition-transform"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: getMarkerColor(incident),
                                    border: '3px solid white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <MapPin className="h-4 w-4 text-white" />
                            </div>
                        </Marker>
                    ))}

                    {selectedIncident && (
                        <Popup
                            latitude={selectedIncident.lat}
                            longitude={selectedIncident.lon}
                            onClose={() => setSelectedIncident(null)}
                            closeButton={true}
                            closeOnClick={false}
                            anchor="bottom"
                            offset={20}
                        >
                            <div className="p-3 min-w-[250px]">
                                <div className="space-y-2">
                                    <div>
                                        <h3 className="font-bold text-sm">{selectedIncident.threat_type}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(selectedIncident.created_at), 'MMM d, h:mm a')}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Badge
                                            className={
                                                selectedIncident.severity === 'high' || selectedIncident.severity === 'critical'
                                                    ? 'bg-red-600'
                                                    : selectedIncident.severity === 'medium'
                                                        ? 'bg-orange-500'
                                                        : 'bg-yellow-500'
                                            }
                                        >
                                            {selectedIncident.severity.toUpperCase()}
                                        </Badge>
                                        <Badge variant="outline">
                                            {selectedIncident.incident_status?.replace('_', ' ').toUpperCase() || 'REPORTED'}
                                        </Badge>
                                    </div>

                                    <p className="text-xs line-clamp-2">{selectedIncident.description}</p>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                window.open(
                                                    `https://www.google.com/maps/search/?api=1&query=${selectedIncident.lat},${selectedIncident.lon}`,
                                                    '_blank'
                                                )
                                            }
                                            className="flex-1"
                                        >
                                            <Navigation className="h-3 w-3 mr-1" />
                                            Navigate
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(`/ranger/incidents/${selectedIncident.id}`)}
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>
            </Card>
        </div>
    );
}
