import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  phone_number: string;
  total_reports: number;
  verified_reports: number;
  responses_sent: number;
  verification_rate: number;
  rank: number;
}

export const CommunityLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Get incident reports by phone
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('sender_phone, verified, source')
        .eq('source', 'sms')
        .not('sender_phone', 'is', null);

      if (incidentsError) throw incidentsError;

      // Get community responses by phone
      const { data: responses, error: responsesError } = await supabase
        .from('community_responses')
        .select('phone_number');

      if (responsesError) throw responsesError;

      // Aggregate data
      const phoneStats = new Map<string, { reports: number; verified: number; responses: number }>();

      incidents?.forEach((incident) => {
        const phone = incident.sender_phone!;
        if (!phoneStats.has(phone)) {
          phoneStats.set(phone, { reports: 0, verified: 0, responses: 0 });
        }
        const stats = phoneStats.get(phone)!;
        stats.reports++;
        if (incident.verified) stats.verified++;
      });

      responses?.forEach((response) => {
        const phone = response.phone_number;
        if (phoneStats.has(phone)) {
          phoneStats.get(phone)!.responses++;
        }
      });

      // Convert to leaderboard entries
      const leaderboardData: LeaderboardEntry[] = Array.from(phoneStats.entries())
        .map(([phone, stats]) => ({
          phone_number: phone,
          total_reports: stats.reports,
          verified_reports: stats.verified,
          responses_sent: stats.responses,
          verification_rate: stats.reports > 0 ? Math.round((stats.verified / stats.reports) * 100) : 0,
          rank: 0,
        }))
        .sort((a, b) => {
          // Sort by total reports, then by verification rate
          if (b.total_reports !== a.total_reports) {
            return b.total_reports - a.total_reports;
          }
          return b.verification_rate - a.verification_rate;
        })
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaders(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const maskPhone = (phone: string) => {
    if (phone.length < 4) return phone;
    return `${phone.slice(0, 4)}****${phone.slice(-2)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Community Engagement Leaderboard
        </CardTitle>
        <CardDescription>
          Top reporters and community responders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No community reports yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader) => (
              <div
                key={leader.phone_number}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  leader.rank <= 3 ? 'bg-primary/5 border-primary/20' : 'bg-card'
                }`}
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(leader.rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{maskPhone(leader.phone_number)}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{leader.total_reports} reports</span>
                    <span>•</span>
                    <span>{leader.responses_sent} responses</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge variant={leader.verification_rate >= 80 ? 'default' : 'secondary'}>
                    {leader.verification_rate}% verified
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {leader.verified_reports}/{leader.total_reports}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
