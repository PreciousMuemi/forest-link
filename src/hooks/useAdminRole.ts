import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminRole = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log('🔐 [useAdminRole] Checking admin role for user:', user?.id);
      
      if (!user) {
        console.log('❌ [useAdminRole] No user provided');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Primary check via has_role() helper
        console.log('🔍 [useAdminRole] Calling has_role RPC...');
        const { data: hasRoleResult, error: hasRoleError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        console.log('🔍 [useAdminRole] has_role result:', hasRoleResult);
        console.log('🔍 [useAdminRole] has_role error:', hasRoleError);

        if (hasRoleError) throw hasRoleError;

        let isAdminFlag = !!hasRoleResult;

        // Fallback: direct check against user_roles for debugging robustness
        if (!isAdminFlag) {
          console.log('🔍 [useAdminRole] has_role returned false, trying direct query...');
          const { data: roleRow, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          console.log('🔍 [useAdminRole] Direct query result:', roleRow);
          console.log('🔍 [useAdminRole] Direct query error:', roleError);

          if (roleError) throw roleError;
          if (roleRow) {
            console.log('✅ [useAdminRole] Found admin role via direct query');
            isAdminFlag = true;
          }
        }

        console.log('🔐 [useAdminRole] Final isAdmin value:', isAdminFlag);
        setIsAdmin(isAdminFlag);
      } catch (error) {
        console.error('❌ [useAdminRole] Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  return { isAdmin, loading };
};
