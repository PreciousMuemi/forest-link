import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface DebugData {
  user: User | null;
  userRoles: Array<{ id: string; role: string; created_at: string }>;
  hasRoleResult: boolean | null;
  hasRoleError: string | null;
}

export default function AdminDebug() {
  const [debugData, setDebugData] = useState<DebugData>({
    user: null,
    userRoles: [],
    hasRoleResult: null,
    hasRoleError: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setDebugData({
          user: null,
          userRoles: [],
          hasRoleResult: null,
          hasRoleError: 'No user logged in',
        });
        return;
      }

      // Get user roles from database
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      // Test has_role() function
      let hasRoleResult = null;
      let hasRoleError = null;
      try {
        const { data: hasRole, error: hasRoleErr } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        hasRoleResult = hasRole;
        if (hasRoleErr) hasRoleError = hasRoleErr.message;
      } catch (err: any) {
        hasRoleError = err.message;
      }

      setDebugData({
        user,
        userRoles: roles || [],
        hasRoleResult,
        hasRoleError,
      });
    } catch (error: any) {
      console.error('Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Access Debug</h1>
          <p className="text-muted-foreground">Diagnostic information for admin authentication</p>
        </div>
        <Button onClick={fetchDebugData} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
            <CardDescription>Authentication session information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {debugData.user ? (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">User ID</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded block mt-1 break-all">
                    {debugData.user.id}
                  </code>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="text-sm mt-1">{debugData.user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Created At</div>
                  <div className="text-sm mt-1">
                    {new Date(debugData.user.created_at).toLocaleString()}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No user logged in</div>
            )}
          </CardContent>
        </Card>

        {/* has_role() Function Result */}
        <Card>
          <CardHeader>
            <CardTitle>has_role() Function</CardTitle>
            <CardDescription>Result of has_role(user_id, 'admin')</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {debugData.hasRoleError ? (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <div>
                  <div className="font-medium">Error</div>
                  <div className="text-sm">{debugData.hasRoleError}</div>
                </div>
              </div>
            ) : debugData.hasRoleResult !== null ? (
              <div className="flex items-center gap-2">
                {debugData.hasRoleResult ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Admin Access Granted</div>
                      <div className="text-sm text-muted-foreground">Function returned TRUE</div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="font-medium">Admin Access Denied</div>
                      <div className="text-sm text-muted-foreground">Function returned FALSE</div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {loading ? 'Loading...' : 'No data'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles (user_roles table)</CardTitle>
          <CardDescription>Direct database query results</CardDescription>
        </CardHeader>
        <CardContent>
          {debugData.userRoles.length > 0 ? (
            <div className="space-y-3">
              {debugData.userRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <Badge variant={role.role === 'admin' ? 'default' : 'secondary'}>
                      {role.role}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-sm">
                      {new Date(role.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No roles found in user_roles table
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
