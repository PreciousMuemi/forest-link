-- Create reward system tables

-- User rewards/points table
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  reports_submitted INTEGER NOT NULL DEFAULT 0,
  reports_verified INTEGER NOT NULL DEFAULT 0,
  reports_with_photos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone_number)
);

-- Reward transactions table
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT NOT NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  reward_type TEXT NOT NULL, -- 'report_submitted', 'report_verified', 'photo_evidence'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reward redemptions table
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT NOT NULL,
  reward_type TEXT NOT NULL, -- 'airtime', 'data_bundle', 'cash_voucher'
  points_cost INTEGER NOT NULL,
  amount TEXT, -- e.g., '100 KES', '1 GB', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards FOR SELECT
  USING (auth.uid() = user_id OR phone_number = (SELECT phone_number FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert rewards"
  ON public.user_rewards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rewards"
  ON public.user_rewards FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all rewards"
  ON public.user_rewards FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for reward_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.reward_transactions FOR SELECT
  USING (user_phone = (SELECT phone_number FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert transactions"
  ON public.reward_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all transactions"
  ON public.reward_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for reward_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (user_phone = (SELECT phone_number FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert redemptions"
  ON public.reward_redemptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage redemptions"
  ON public.reward_redemptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to award points
CREATE OR REPLACE FUNCTION award_report_points(
  p_phone_number TEXT,
  p_incident_id UUID,
  p_reward_type TEXT,
  p_points INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Insert or update user rewards
  INSERT INTO public.user_rewards (phone_number, total_points, reports_submitted, reports_verified, reports_with_photos)
  VALUES (
    p_phone_number,
    p_points,
    CASE WHEN p_reward_type = 'report_submitted' THEN 1 ELSE 0 END,
    CASE WHEN p_reward_type = 'report_verified' THEN 1 ELSE 0 END,
    CASE WHEN p_reward_type = 'photo_evidence' THEN 1 ELSE 0 END
  )
  ON CONFLICT (phone_number) DO UPDATE SET
    total_points = user_rewards.total_points + p_points,
    reports_submitted = user_rewards.reports_submitted + CASE WHEN p_reward_type = 'report_submitted' THEN 1 ELSE 0 END,
    reports_verified = user_rewards.reports_verified + CASE WHEN p_reward_type = 'report_verified' THEN 1 ELSE 0 END,
    reports_with_photos = user_rewards.reports_with_photos + CASE WHEN p_reward_type = 'photo_evidence' THEN 1 ELSE 0 END,
    updated_at = now();

  -- Log transaction
  INSERT INTO public.reward_transactions (user_phone, incident_id, points_earned, reward_type)
  VALUES (p_phone_number, p_incident_id, p_points, p_reward_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;