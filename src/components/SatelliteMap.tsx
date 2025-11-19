import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { MapLayerControl } from './MapLayerControl';

interface Incident {
  id: string;
  lat: number;
  lon: number;
  threat_type: string;
  severity: string;
  timestamp: string;
}

const SatelliteMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentLayer, setCurrentLayer] = useState('satellite-streets-v12');

  useEffect(() => {
    if (!mapContainer.current) return;

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoicHJlZXdhbmppcnUiLCJhIjoiY21pNTNncXdxMTk0YjJtcXc2bXdteHAyMyJ9.hiR41DMOmSiUFh1xUIoIeQ';
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${currentLayer}`,
      center: [36.8219, -1.2921], // Kenya coordinates
      zoom: 6,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Fetch incidents
    const fetchIncidents = async () => {
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (data) {
        setIncidents(data);
      }
    };

    fetchIncidents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('incidents-map')
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
      map.current?.remove();
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!map.current || incidents.length === 0) return;

    // Clear existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add markers for each incident
    incidents.forEach((incident) => {
      const el = document.createElement('div');
      el.className = 'threat-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      
      const severityColors: Record<string, string> = {
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#3b82f6',
      };
      
      el.style.backgroundColor = severityColors[incident.severity] || '#6b7280';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${incident.threat_type}</h3>
          <p style="color: #666; font-size: 12px;">Severity: ${incident.severity}</p>
          <p style="color: #666; font-size: 12px;">${new Date(incident.timestamp).toLocaleString()}</p>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([incident.lon, incident.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [incidents]);

  const handleLayerChange = (layer: string) => {
    if (map.current) {
      map.current.setStyle(`mapbox://styles/mapbox/${layer}`);
      setCurrentLayer(layer);
    }
  };

  return (
    <div className="relative w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden shadow-lg border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-background/90 backdrop-blur-sm px-2 md:px-4 py-1.5 md:py-2 rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs md:text-sm font-medium">Live Satellite Feed</span>
        </div>
      </div>
      <div className="absolute top-2 md:top-4 right-2 md:right-4">
        <MapLayerControl onLayerChange={handleLayerChange} currentLayer={currentLayer} />
      </div>
    </div>
  );
};

export default SatelliteMap;
