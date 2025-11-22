import { supabase } from '@/integrations/supabase/client';

export const checkRangerAccess = async (userId: string): Promise<boolean> => {
    try {
        // Check if user has admin role (admins can access ranger portal)
        const { data: adminRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .maybeSingle();

        if (adminRole) return true;

        // Check if user is a ranger
        const { data: rangerData } = await supabase
            .from('rangers')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        return !!rangerData;
    } catch (error) {
        console.error('Error checking ranger access:', error);
        return false;
    }
};
