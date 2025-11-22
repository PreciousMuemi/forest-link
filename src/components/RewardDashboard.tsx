import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Gift, Coins, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserReward {
  total_points: number;
  reports_submitted: number;
  reports_verified: number;
  reports_with_photos: number;
}

interface Transaction {
  id: string;
  points_earned: number;
  reward_type: string;
  created_at: string;
  incidents?: {
    threat_type: string;
  };
}

export const RewardDashboard = ({ phoneNumber }: { phoneNumber?: string }) => {
  const [rewards, setRewards] = useState<UserReward | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phoneNumber) return;
    
    fetchRewards();
    fetchTransactions();
  }, [phoneNumber]);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (error) throw error;
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reward_transactions')
        .select(`
          *,
          incidents (
            threat_type
          )
        `)
        .eq('user_phone', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'report_submitted': return '🟠 Report Submitted';
      case 'report_verified': return '🟢 Report Verified';
      case 'photo_evidence': return '📸 Photo Evidence';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Loading rewards...</p>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-accent" />
        <h3 className="text-xl font-bold text-foreground mb-2">Start Earning Rewards!</h3>
        <p className="text-muted-foreground">
          Submit verified forest threat reports to earn points and rewards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass-card border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-accent" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{rewards.total_points}</div>
            <p className="text-xs text-muted-foreground mt-1">Available to redeem</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Reports Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{rewards.reports_submitted}</div>
            <p className="text-xs text-muted-foreground mt-1">+10 points each</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Verified Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{rewards.reports_verified}</div>
            <p className="text-xs text-muted-foreground mt-1">+50 points each</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              Photo Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{rewards.reports_with_photos}</div>
            <p className="text-xs text-muted-foreground mt-1">+20 bonus points</p>
          </CardContent>
        </Card>
      </div>

      {/* Reward Tiers */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-accent" />
            Available Rewards
          </CardTitle>
          <CardDescription>Redeem your points for airtime, data, or vouchers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-card border border-border hover:shadow-glow-accent transition-all">
              <h4 className="font-bold text-foreground mb-2">Airtime</h4>
              <p className="text-2xl font-bold text-accent mb-2">100 KES</p>
              <p className="text-sm text-muted-foreground mb-3">Cost: 200 points</p>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                Coming Soon
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-gradient-card border border-border hover:shadow-glow-accent transition-all">
              <h4 className="font-bold text-foreground mb-2">Data Bundle</h4>
              <p className="text-2xl font-bold text-accent mb-2">1 GB</p>
              <p className="text-sm text-muted-foreground mb-3">Cost: 300 points</p>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                Coming Soon
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-gradient-card border border-border hover:shadow-glow-accent transition-all">
              <h4 className="font-bold text-foreground mb-2">Cash Voucher</h4>
              <p className="text-2xl font-bold text-accent mb-2">500 KES</p>
              <p className="text-sm text-muted-foreground mb-3">Cost: 1000 points</p>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                Coming Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest reward transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-card border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Coins className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {getRewardTypeLabel(tx.reward_type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.incidents?.threat_type || 'Report'} · {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">+{tx.points_earned}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
