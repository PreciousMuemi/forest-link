import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, Clock, Navigation, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Ranger {
  id: string;
  name: string;
  phone_number: string;
  lat: number;
  lon: number;
  status: string;
  current_incident_id: string | null;
}

interface RangerWithIncident extends Ranger {
  incidents?: {
    id: string;
    threat_type: string;
    severity: string;
    lat: number;
    lon: number;
  };
}

export const RangerDispatchBoard = () => {
  const [rangers, setRangers] = useState<RangerWithIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRangers();

    // Subscribe to real-time ranger updates
    const channel = supabase
      .channel('rangers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rangers',
        },
        () => {
          fetchRangers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRangers = async () => {
    try {
      const { data, error } = await supabase
        .from('rangers')
        .select(`
          *,
          incidents (
            id,
            threat_type,
            severity,
            lat,
            lon
          )
        `)
        .order('name');

      if (error) throw error;
      setRangers(data || []);
    } catch (error) {
      console.error('Error fetching rangers:', error);
      toast.error('Failed to load rangers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'on_duty':
        return 'bg-blue-500';
      case 'en_route':
        return 'bg-orange-500';
      case 'on_scene':
        return 'bg-red-500';
      case 'off_duty':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'on_duty':
        return 'On Duty';
      case 'en_route':
        return 'En Route';
      case 'on_scene':
        return 'On Scene';
      case 'off_duty':
        return 'Off Duty';
      default:
        return status;
    }
  };

  const availableCount = rangers.filter(r => r.status === 'available').length;
  const activeCount = rangers.filter(r => ['on_duty', 'en_route', 'on_scene'].includes(r.status)).length;

  if (loading) {
    return <div>Loading rangers...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{availableCount}</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{rangers.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Ranger List */}
      <div className="grid gap-3">
        {rangers.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No rangers registered in the system</p>
          </Card>
        ) : (
          rangers.map((ranger) => (
            <Card key={ranger.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-3 rounded-full ${getStatusColor(ranger.status)}`}>
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{ranger.name}</h4>
                      <Badge variant={ranger.status === 'available' ? 'default' : 'secondary'}>
                        {getStatusLabel(ranger.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{ranger.lat.toFixed(4)}, {ranger.lon.toFixed(4)}</span>
                      </div>
                      
                      {ranger.current_incident_id && ranger.incidents && (
                        <div className="mt-2 p-2 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium mb-1">Current Incident:</p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="text-xs">
                              {ranger.incidents.threat_type}
                            </Badge>
                            <Badge variant="destructive" className="text-xs">
                              {ranger.incidents.severity}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};