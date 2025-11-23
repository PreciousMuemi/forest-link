import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { checkRangerAccess } from '@/utils/rangerAccess';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    MapPin,
    AlertTriangle,
    Bell,
    LogOut,
    Shield,
    Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const menuItems = [
    { title: 'My Incidents', url: '/ranger', icon: AlertTriangle },
    { title: 'Map View', url: '/ranger/map', icon: Map },
    { title: 'Notifications', url: '/ranger/notifications', icon: Bell },
];

export default function RangerLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null);

            if (!session?.user) {
                navigate('/auth');
                return;
            }

            // Check if user has ranger access (admin or ranger role)
            const hasAccess = await checkRangerAccess(session.user.id);
            
            if (!hasAccess) {
                toast.error('Access denied. Ranger accounts only.');
                navigate('/admin');
                return;
            }

            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                navigate('/auth');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    useEffect(() => {
        // Fetch unread notifications count
        const fetchUnreadCount = async () => {
            if (!user) return;

            const { count } = await supabase
                .from('ranger_alerts')
                .select('*', { count: 'exact', head: true })
                .eq('ranger_id', 'ranger')
                .eq('read', false);

            setUnreadCount(count || 0);
        };

        fetchUnreadCount();

        // Subscribe to new alerts
        const channel = supabase
            .channel('ranger-alerts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ranger_alerts',
                    filter: 'ranger_id=eq.ranger',
                },
                () => {
                    fetchUnreadCount();
                    toast.info('New alert received!');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">Loading Ranger Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background admin-light">
        <Sidebar className="border-r border-border bg-card">
                    <SidebarContent>
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary">
                                <Shield className="h-6 w-6 text-white" />
                                </div>
                            <div>
                                <h2 className="font-bold text-lg text-foreground">Ranger Portal</h2>
                                <p className="text-xs text-muted-foreground">Field Response</p>
                            </div>
                            </div>
                        </div>

                    <SidebarGroup>
                        <SidebarGroupLabel className="text-muted-foreground">Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname === item.url}
                                            className="hover:bg-accent"
                                        >
                                                <Link to={item.url}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                    {item.title === 'Notifications' && unreadCount > 0 && (
                                                        <Badge variant="destructive" className="ml-auto">
                                                            {unreadCount}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                    <div className="mt-auto p-4 border-t border-border">
                        <div className="mb-3 p-3 rounded-lg bg-accent/10">
                            <p className="text-xs font-semibold text-foreground">Logged in as:</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            className="w-full"
                        >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </SidebarContent>
                </Sidebar>

            <div className="flex-1 flex flex-col">
                <header className="border-b border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="text-foreground" />
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h1 className="text-xl font-bold text-foreground">
                                ForestLink - Ranger Response
                            </h1>
                        </div>
                    </div>
                </header>

                    <main className="flex-1 overflow-auto p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
