import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Users, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityResponse {
  id: string;
  phone_number: string;
  response: string;
  message: string | null;
  responded_at: string;
}

interface CommunityResponsesProps {
  incidentId: string;
}

export const CommunityResponses = ({ incidentId }: CommunityResponsesProps) => {
  const [responses, setResponses] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`responses-${incidentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_responses',
          filter: `incident_id=eq.${incidentId}`,
        },
        (payload) => {
          setResponses((prev) => [payload.new as CommunityResponse, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incidentId]);

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('community_responses')
        .select('*')
        .eq('incident_id', incidentId)
        .order('responded_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResponseBadge = (response: string) => {
    switch (response) {
      case 'SAFE':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">✅ Safe</Badge>;
      case 'NEED_HELP':
        return <Badge variant="destructive">🚨 Need Help</Badge>;
      case 'EVACUATING':
        return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">⚠️ Evacuating</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  const summary = {
    safe: responses.filter(r => r.response === 'SAFE').length,
    needHelp: responses.filter(r => r.response === 'NEED_HELP').length,
    evacuating: responses.filter(r => r.response === 'EVACUATING').length,
    total: responses.length,
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No community responses yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Community Response Summary</h4>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{summary.safe}</div>
            <div className="text-xs text-muted-foreground">Safe</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">{summary.needHelp}</div>
            <div className="text-xs text-muted-foreground">Need Help</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{summary.evacuating}</div>
            <div className="text-xs text-muted-foreground">Evacuating</div>
          </div>
        </div>
      </Card>

      {/* Response List */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Individual Responses ({responses.length})
        </h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {responses.map((response) => (
            <Card key={response.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getResponseBadge(response.response)}
                    <span className="text-xs text-muted-foreground">
                      {response.phone_number.slice(-4).padStart(response.phone_number.length, '•')}
                    </span>
                  </div>
                  {response.message && (
                    <p className="text-xs text-muted-foreground mt-1">{response.message}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(response.responded_at).toLocaleTimeString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};