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

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${currentLayer}`,
      center: [36.8219, -1.2921], // Kenya coordinates
      zoom: 6,
      pitch: 60,
      bearing: -15,
    });

    // Cinematic camera animation on load
    map.current.on('load', () => {
      map.current?.easeTo({
        pitch: 45,
        bearing: 0,
        duration: 3000,
        easing: (t) => t * (2 - t), // easeOutQuad
      });
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

    // Add animated markers for each incident with WOW effect
    incidents.forEach((incident) => {
      const el = document.createElement('div');
      el.className = 'threat-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '3px solid white';
      el.style.position = 'relative';
      el.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
      
      const severityColors: Record<string, string> = {
        critical: '#ef4444',
        high: '#f97316',
        medium: '#eab308',
        low: '#3b82f6',
      };
      
      const color = severityColors[incident.severity] || '#6b7280';
      el.style.backgroundColor = color;
      el.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
      
      // Add animated ripple effect
      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.top = '50%';
      ripple.style.left = '50%';
      ripple.style.width = '40px';
      ripple.style.height = '40px';
      ripple.style.borderRadius = '50%';
      ripple.style.border = `2px solid ${color}`;
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.animation = 'ripple 2s ease-out infinite';
      ripple.style.pointerEvents = 'none';
      el.appendChild(ripple);

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
    <div className="relative w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl border-2 border-border bg-white">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Live indicator - Modern Light Style */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border-2 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping" />
          </div>
          <span className="text-sm font-bold text-foreground">🛰️ Live Satellite</span>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 z-10">
        <MapLayerControl onLayerChange={handleLayerChange} currentLayer={currentLayer} />
      </div>

      {/* Ripple animation styles */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SatelliteMap;
