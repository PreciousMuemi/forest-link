import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface RiskZone {
  lat: number;
  lon: number;
  incident_count: number;
  risk_score: number;
  primary_threat: string;
  area_name: string;
}

export const RiskHeatMap = () => {
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncidents, setTotalIncidents] = useState(0);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);

      // Fetch recent incidents (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('lat, lon, threat_type, severity, created_at')
        .gte('created_at', ninetyDaysAgo.toISOString());

      if (error) throw error;

      setTotalIncidents(incidents?.length || 0);

      // Group incidents by approximate location (0.1 degree grid ~11km)
      const gridSize = 0.1;
      const locationClusters = new Map<string, {
        lat: number;
        lon: number;
        incidents: typeof incidents;
      }>();

      incidents?.forEach((incident) => {
        const gridLat = Math.floor(incident.lat / gridSize) * gridSize;
        const gridLon = Math.floor(incident.lon / gridSize) * gridSize;
        const key = `${gridLat},${gridLon}`;

        if (!locationClusters.has(key)) {
          locationClusters.set(key, {
            lat: gridLat + gridSize / 2,
            lon: gridLon + gridSize / 2,
            incidents: [],
          });
        }
        locationClusters.get(key)!.incidents.push(incident);
      });

      // Calculate risk scores
      const zones: RiskZone[] = Array.from(locationClusters.values())
        .map((cluster) => {
          const incidentCount = cluster.incidents.length;
          
          // Calculate severity score
          const severityScores = { critical: 4, high: 3, medium: 2, low: 1 };
          const avgSeverity = cluster.incidents.reduce((sum, inc) => 
            sum + (severityScores[inc.severity as keyof typeof severityScores] || 1), 0
          ) / incidentCount;

          // Calculate recency score (more recent = higher risk)
          const avgRecency = cluster.incidents.reduce((sum, inc) => {
            const daysAgo = (Date.now() - new Date(inc.created_at).getTime()) / (1000 * 60 * 60 * 24);
            return sum + Math.max(0, 90 - daysAgo) / 90;
          }, 0) / incidentCount;

          // Risk score: frequency * severity * recency
          const riskScore = Math.round((incidentCount / 5) * avgSeverity * avgRecency * 100);

          // Most common threat type
          const threatCounts = cluster.incidents.reduce((acc, inc) => {
            acc[inc.threat_type] = (acc[inc.threat_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          const primaryThreat = Object.entries(threatCounts)
            .sort(([, a], [, b]) => b - a)[0][0];

          return {
            lat: cluster.lat,
            lon: cluster.lon,
            incident_count: incidentCount,
            risk_score: Math.min(riskScore, 100),
            primary_threat: primaryThreat,
            area_name: getAreaName(cluster.lat, cluster.lon),
          };
        })
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 8);

      setRiskZones(zones);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAreaName = (lat: number, lon: number) => {
    // Simplified area naming based on Kenya regions
    if (lat > -0.5 && lat < 0.5 && lon > 36.5 && lon < 37.5) return 'Nairobi Region';
    if (lat > 0.5 && lat < 2 && lon > 36 && lon < 38) return 'Central Kenya';
    if (lat > -1.5 && lat < -0.5 && lon > 36 && lon < 37) return 'Rift Valley';
    if (lat > -2.5 && lat < -1.5 && lon > 37 && lon < 39) return 'Eastern Kenya';
    if (lat > -4 && lat < -2.5 && lon > 38 && lon < 40) return 'Coastal Region';
    return 'Kenya Forest Area';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) return <Badge variant="destructive">Critical Risk</Badge>;
    if (score >= 50) return <Badge className="bg-orange-600">High Risk</Badge>;
    if (score >= 25) return <Badge variant="secondary">Moderate Risk</Badge>;
    return <Badge variant="outline">Low Risk</Badge>;
  };

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          Predictive Risk Heat Map
        </CardTitle>
        <CardDescription>
          High-risk zones based on {totalIncidents} incidents over 90 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {riskZones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Insufficient data for risk analysis</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {riskZones.map((zone, index) => (
              <div
                key={`${zone.lat}-${zone.lon}`}
                className={`p-4 rounded-lg border ${
                  zone.risk_score >= 75 
                    ? 'bg-destructive/10 border-destructive/30' 
                    : zone.risk_score >= 50
                    ? 'bg-orange-600/10 border-orange-600/30'
                    : 'bg-card'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{zone.area_name}</span>
                  </div>
                  {getRiskBadge(zone.risk_score)}
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <span className="font-semibold text-foreground">{zone.risk_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incidents:</span>
                    <span className="font-semibold text-foreground">{zone.incident_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primary Threat:</span>
                    <span className="font-medium text-foreground capitalize">
                      {zone.primary_threat.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Location:</span>
                    <span className="font-mono">
                      {zone.lat.toFixed(2)}, {zone.lon.toFixed(2)}
                    </span>
                  </div>
                </div>

                {zone.risk_score >= 75 && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Requires immediate attention</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
