import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    userId: string | null;
    hasRole: boolean;
    existingRole: string | null;
  }>({ userId: null, hasRole: false, existingRole: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDebugInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDebugInfo({ userId: null, hasRole: false, existingRole: null });
        return;
      }

      const { data: role } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      setDebugInfo({
        userId: user.id,
        hasRole: !!role,
        existingRole: role?.role || null,
      });
    };

    fetchDebugInfo();
  }, []);

  const setupAdmin = async () => {
    setLoading(true);
    try {
      console.log('🔧 [AdminSetup] Starting admin setup...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔧 [AdminSetup] Current user:', user?.id);
      
      if (!user) {
        console.log('❌ [AdminSetup] No user found');
        toast.error('Please log in first');
        navigate('/auth');
        return;
      }

      // Check if user already has a role
      console.log('🔍 [AdminSetup] Checking for existing role...');
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('🔍 [AdminSetup] Existing role:', existingRole);
      console.log('🔍 [AdminSetup] Check error:', checkError);

      if (existingRole) {
        console.log('✅ [AdminSetup] User already has role:', existingRole.role);
        toast.info('You already have a role assigned');
        navigate('/admin');
        return;
      }

      // Insert admin role
      console.log('➕ [AdminSetup] Inserting admin role...');
      const { data: insertData, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        })
        .select();

      console.log('➕ [AdminSetup] Insert result:', insertData);
      console.log('➕ [AdminSetup] Insert error:', error);

      if (error) throw error;

      console.log('✅ [AdminSetup] Admin role granted successfully!');
      toast.success('Admin role granted! Redirecting...');
      setTimeout(() => navigate('/admin'), 1000);
    } catch (error: any) {
      console.error('❌ [AdminSetup] Setup error:', error);
      toast.error(error.message || 'Failed to setup admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Grant yourself admin access to manage the ForestGuard system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="font-medium min-w-24">User ID:</div>
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                  {debugInfo.userId || 'Not logged in'}
                </code>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="font-medium min-w-24">Has Role:</div>
                <div className="flex items-center gap-2">
                  {debugInfo.hasRole ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Yes</span>
                      {debugInfo.existingRole && (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {debugInfo.existingRole}
                        </code>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">No role assigned</span>
                    </>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Button 
            onClick={setupAdmin} 
            disabled={loading || !debugInfo.userId}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Grant Admin Access'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
