import { supabase } from '@/integrations/supabase/client';

type AccessCheckParams = {
    userId: string;
    email?: string | null;
};

const allowedRangerEmails = (import.meta.env.VITE_RANGER_ALLOWED_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const cacheKeyFor = (userId: string) => `ranger-access:${userId}`;

const getCachedAccess = (userId: string) => {
    if (typeof window === 'undefined') return null;
    const cached = window.sessionStorage.getItem(cacheKeyFor(userId));
    return cached === null ? null : cached === 'true';
};

const setCachedAccess = (userId: string, value: boolean) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(cacheKeyFor(userId), value ? 'true' : 'false');
};

export const checkRangerAccess = async ({ userId, email }: AccessCheckParams): Promise<boolean> => {
    const cached = getCachedAccess(userId);
    if (cached !== null) {
        return cached;
    }

    if (email && allowedRangerEmails.includes(email.toLowerCase())) {
        setCachedAccess(userId, true);
        return true;
    }

    try {
        const adminRolePromise = supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .maybeSingle();

        const rangerPromise = supabase
            .from('rangers')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        const [adminRoleResult, rangerResult] = await Promise.all([adminRolePromise, rangerPromise]);

        if (adminRoleResult.error) {
            console.error('Error checking admin role:', adminRoleResult.error);
        }

        if (rangerResult.error) {
            console.error('Error checking ranger record:', rangerResult.error);
        }

        const hasAccess = Boolean(adminRoleResult.data) || Boolean(rangerResult.data);
        setCachedAccess(userId, hasAccess);
        return hasAccess;
    } catch (error) {
        console.error('Error checking ranger access:', error);
        return false;
    }
};
