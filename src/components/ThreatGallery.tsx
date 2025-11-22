import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, Flame, TreeDeciduous, Shield, MapPin, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface VerifiedIncident {
  id: string;
  threat_type: string;
  image_url: string | null;
  description: string | null;
  lat: number;
  lon: number;
  created_at: string;
  severity: string;
  verified: boolean;
}

const threatTypes: Record<string, { icon: any; color: string; bgColor: string }> = {
  'Fire': { icon: Flame, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  'Deforestation': { icon: TreeDeciduous, color: 'text-warning', bgColor: 'bg-warning/10' },
  'Illegal Logging': { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  'Wildlife Poaching': { icon: Shield, color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
  'Drought': { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-600/10' },
  'Wildfire': { icon: Flame, color: 'text-red-600', bgColor: 'bg-red-600/10' },
};

export const ThreatGallery = () => {
  const [incidents, setIncidents] = useState<VerifiedIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifiedIncidents();

    // Subscribe to real-time updates for all incidents
    const channel = supabase
      .channel('all-incidents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        () => {
          console.log('🔄 Real-time update received, refreshing incidents...');
          fetchVerifiedIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVerifiedIncidents = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching all community reports...');

      // Fetch ALL incidents with images (both verified and pending)
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Error fetching incidents:', error);
        throw error;
      }

      console.log('✅ Fetched incidents:', data?.length || 0, 'total reports');
      console.log('📊 Verified:', data?.filter(i => i.verified).length || 0);
      console.log('⏳ Pending:', data?.filter(i => !i.verified).length || 0);
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load community reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading verified threats...</p>
        </div>
      </div>
    );
  }

  const verifiedCount = incidents.filter(i => i.verified).length;
  const pendingCount = incidents.filter(i => !i.verified).length;

  if (incidents.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-muted/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">No Reports Yet</h3>
          <p className="text-muted-foreground">
            Community threat reports will appear here once they are uploaded. You can track the status of your reports!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            💡 <strong>Tip:</strong> Upload a threat report above to get started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Community Threat Reports</h2>
          <p className="text-muted-foreground">
            Track your reports and see verified threats from the community
          </p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Badge variant="outline" className="gap-2 px-4 py-2 border-orange-500 text-orange-600">
              <Clock className="h-4 w-4" />
              {pendingCount} Pending Review
            </Badge>
          )}
          {verifiedCount > 0 && (
            <Badge variant="outline" className="gap-2 px-4 py-2 border-success text-success">
              <CheckCircle2 className="h-4 w-4" />
              {verifiedCount} Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((incident) => {
          const threatInfo = threatTypes[incident.threat_type] || threatTypes['Fire'];
          const Icon = threatInfo.icon;

          return (
            <Card
              key={incident.id}
              className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 ${incident.verified ? 'border-success/30' : 'border-orange-500/30'
                }`}
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {incident.image_url && (
                  <img
                    src={incident.image_url}
                    alt={`${incident.threat_type} threat`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Threat Type Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${threatInfo.bgColor} ${threatInfo.color} border-0 font-semibold`}>
                    <Icon className="h-4 w-4 mr-1" />
                    {incident.threat_type}
                  </Badge>
                </div>

                {/* Status Badge - Top Left */}
                <div className="absolute top-4 left-4">
                  {incident.verified ? (
                    <Badge className="bg-success text-white font-semibold">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      VERIFIED
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500 text-white font-semibold animate-pulse">
                      <Clock className="h-3 w-3 mr-1" />
                      PENDING REVIEW
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-foreground mb-2">{incident.threat_type}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {incident.description || 'Community-reported environmental threat'}
                </p>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>

                {/* Status Message */}
                {incident.verified ? (
                  <div className="mt-4 p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-success font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified by Admin Team
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This report has been reviewed and confirmed
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-xs text-orange-600 font-semibold">
                      <Clock className="h-4 w-4" />
                      Under Review
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our admin team is reviewing your report. You'll be notified once verified!
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info banner */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-orange-50 border-2 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">
              Track Your Community Reports
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-orange-600">🟠 Pending Review:</strong> Your report has been received and is being reviewed by our admin team. You'll receive an SMS notification once it's verified!
              </p>
              <p>
                <strong className="text-success">🟢 Verified:</strong> Report confirmed by our team with photographic evidence and GPS coordinates. Thank you for keeping Kenya's forests safe!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
