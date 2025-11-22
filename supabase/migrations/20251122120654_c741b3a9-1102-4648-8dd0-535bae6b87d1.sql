-- Fix function search path for security
CREATE OR REPLACE FUNCTION award_report_points(
  p_phone_number TEXT,
  p_incident_id UUID,
  p_reward_type TEXT,
  p_points INTEGER
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;