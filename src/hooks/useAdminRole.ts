import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminRole = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Primary check via has_role() helper
        const { data: hasRoleResult, error: hasRoleError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        if (hasRoleError) throw hasRoleError;

        let isAdminFlag = !!hasRoleResult;

        // Fallback: direct check against user_roles for debugging robustness
        if (!isAdminFlag) {
          const { data: roleRow, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (roleError) throw roleError;
          if (roleRow) {
            isAdminFlag = true;
          }
        }

        setIsAdmin(isAdminFlag);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  return { isAdmin, loading };
};
