import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, Navigation, Phone, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Incident {
  id: string;
  threat_type: string;
  severity: string;
  lat: number;
  lon: number;
  description: string;
  location?: string;
  incident_status: string;
  created_at: string;
}

interface Ranger {
  id: string;
  name: string;
  phone_number: string;
  status: string;
  current_incident_id: string | null;
  lat: number;
  lon: number;
}

export default function RangerMobile() {
  const [ranger, setRanger] = useState<Ranger | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadRangerData();

    // Subscribe to ranger updates
    const channel = supabase
      .channel('ranger-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rangers',
        },
        () => {
          loadRangerData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const loadRangerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get ranger profile
      const { data: rangerData, error: rangerError } = await supabase
        .from('rangers')
        .select('*')
        .eq('phone_number', user.phone || user.email)
        .maybeSingle();

      if (rangerError) throw rangerError;
      
      if (!rangerData) {
        toast.error('No ranger profile found. Please contact admin.');
        return;
      }
      
      setRanger(rangerData);

      // Get assigned incident if any
      if (rangerData.current_incident_id) {
        const { data: incidentData, error: incidentError } = await supabase
          .from('incidents')
          .select('*')
          .eq('id', rangerData.current_incident_id)
          .maybeSingle();

        if (incidentError) throw incidentError;
        setIncident(incidentData || null);
      } else {
        setIncident(null);
      }
    } catch (error) {
      console.error('Error loading ranger data:', error);
      toast.error('Failed to load ranger data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!ranger) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('rangers')
        .update({ status: newStatus })
        .eq('id', ranger.id);

      if (error) throw error;
      
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
      loadRangerData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      available: 'Available',
      on_duty: 'On Duty',
      en_route: 'En Route',
      on_scene: 'On Scene',
      off_duty: 'Off Duty',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      available: 'bg-green-500',
      on_duty: 'bg-blue-500',
      en_route: 'bg-orange-500',
      on_scene: 'bg-red-500',
      off_duty: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const openNavigation = () => {
    if (incident) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${incident.lat},${incident.lon}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!ranger) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Ranger Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Your account is not registered as a ranger in the system.
          </p>
          <Button onClick={() => navigate('/admin')} className="w-full">
            Go to Admin Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getStatusColor(ranger.status)}`}>
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{ranger.name}</h1>
              <p className="text-sm opacity-90">{getStatusLabel(ranger.status)}</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate('/admin')}
          >
            Admin
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Status Updates */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quick Status Update
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => updateStatus('available')}
              disabled={updating || ranger.status === 'available'}
              variant={ranger.status === 'available' ? 'default' : 'outline'}
              className="w-full"
            >
              Available
            </Button>
            <Button
              onClick={() => updateStatus('en_route')}
              disabled={updating || ranger.status === 'en_route'}
              variant={ranger.status === 'en_route' ? 'default' : 'outline'}
              className="w-full"
            >
              En Route
            </Button>
            <Button
              onClick={() => updateStatus('on_scene')}
              disabled={updating || ranger.status === 'on_scene'}
              variant={ranger.status === 'on_scene' ? 'default' : 'outline'}
              className="w-full"
            >
              On Scene
            </Button>
            <Button
              onClick={() => updateStatus('off_duty')}
              disabled={updating || ranger.status === 'off_duty'}
              variant={ranger.status === 'off_duty' ? 'default' : 'outline'}
              className="w-full"
            >
              Off Duty
            </Button>
          </div>
        </Card>

        {/* Current Incident */}
        {incident ? (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Current Assignment
              </h2>
              <Badge variant={getSeverityColor(incident.severity)}>
                {incident.severity}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Threat Type</p>
                <p className="font-medium">{incident.threat_type}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{incident.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {incident.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{incident.description}</p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <Button 
                  onClick={openNavigation}
                  className="w-full"
                  size="lg"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate to Incident
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`tel:+254712345678`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Dispatch
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Active Assignment</h3>
            <p className="text-sm text-muted-foreground">
              You currently have no incidents assigned. Stay alert for new assignments.
            </p>
          </Card>
        )}

        {/* Current Location */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Your Location
          </h2>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Coordinates</p>
              <p className="font-mono">{ranger.lat.toFixed(4)}, {ranger.lon.toFixed(4)}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://www.google.com/maps?q=${ranger.lat},${ranger.lon}`, '_blank')}
            >
              View Map
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
