-- Allow rangers to view their own ranger record (by user_id match)
CREATE POLICY "Rangers can view their own record"
ON rangers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow rangers to update their own status and location
CREATE POLICY "Rangers can update their own record"
ON rangers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to update incidents (needed for ranger assignment)
CREATE POLICY "Admins can update incidents"
ON incidents
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));