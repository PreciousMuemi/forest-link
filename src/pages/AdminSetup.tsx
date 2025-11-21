import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setupAdmin = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in first');
        navigate('/auth');
        return;
      }

      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingRole) {
        toast.info('You already have a role assigned');
        navigate('/admin');
        return;
      }

      // Insert admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast.success('Admin role granted! Redirecting...');
      setTimeout(() => navigate('/admin'), 1000);
    } catch (error: any) {
      console.error('Setup error:', error);
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
        <CardContent>
          <Button 
            onClick={setupAdmin} 
            disabled={loading}
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
