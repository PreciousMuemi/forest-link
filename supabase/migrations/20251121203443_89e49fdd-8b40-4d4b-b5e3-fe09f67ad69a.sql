-- Allow users to grant themselves admin role if they have no existing role (bootstrap)
CREATE POLICY "Users can bootstrap admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'admin'::app_role
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )
);