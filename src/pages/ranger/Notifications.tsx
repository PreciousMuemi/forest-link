import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    BellOff,
    AlertTriangle,
    Flame,
    MessageSquare,
    CheckCircle,
    Eye,
    Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Alert {
    id: string;
    ranger_id: string;
    incident_id: string | null;
    alert_type: string;
    title: string;
    message: string | null;
    read: boolean;
    created_at: string;
}

export default function RangerNotifications() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();

        // Subscribe to new alerts
        const channel = supabase
            .channel('ranger-alerts-page')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ranger_alerts',
                    filter: 'ranger_id=eq.ranger',
                },
                () => {
                    fetchAlerts();
                    toast.info('New alert received!');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('ranger_alerts')
                .select('*')
                .eq('ranger_id', 'ranger')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setAlerts(data || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (alertId: string) => {
        try {
            const { error } = await supabase
                .from('ranger_alerts')
                .update({ read: true })
                .eq('id', alertId);

            if (error) throw error;

            fetchAlerts();
        } catch (error) {
            console.error('Error marking alert as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { error } = await supabase
                .from('ranger_alerts')
                .update({ read: true })
                .eq('ranger_id', 'ranger')
                .eq('read', false);

            if (error) throw error;

            toast.success('All notifications marked as read');
            fetchAlerts();
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const deleteAlert = async (alertId: string) => {
        try {
            const { error } = await supabase
                .from('ranger_alerts')
                .delete()
                .eq('id', alertId);

            if (error) throw error;

            toast.success('Notification deleted');
            fetchAlerts();
        } catch (error) {
            console.error('Error deleting alert:', error);
            toast.error('Failed to delete notification');
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'high_severity':
                return <Flame className="h-5 w-5 text-red-600" />;
            case 'new_incident':
                return <AlertTriangle className="h-5 w-5 text-orange-600" />;
            case 'citizen_report':
                return <MessageSquare className="h-5 w-5 text-blue-600" />;
            case 'sms_report':
                return <MessageSquare className="h-5 w-5 text-green-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'high_severity':
                return 'border-l-red-600 bg-red-50';
            case 'new_incident':
                return 'border-l-orange-600 bg-orange-50';
            case 'citizen_report':
                return 'border-l-blue-600 bg-blue-50';
            case 'sms_report':
                return 'border-l-green-600 bg-green-50';
            default:
                return 'border-l-gray-600 bg-gray-50';
        }
    };

    const unreadCount = alerts.filter((a) => !a.read).length;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-red-900">Notifications</h1>
                    <p className="text-sm text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button onClick={markAllAsRead} variant="outline" className="border-red-300">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark All Read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">Loading notifications...</p>
                    </Card>
                ) : alerts.length === 0 ? (
                    <Card className="p-12 text-center">
                        <BellOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                            You're all caught up! New alerts will appear here.
                        </p>
                    </Card>
                ) : (
                    alerts.map((alert) => (
                        <Card
                            key={alert.id}
                            className={`p-4 border-l-4 transition-all ${alert.read ? 'opacity-60' : ''
                                } ${getAlertColor(alert.alert_type)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white">
                                    {getAlertIcon(alert.alert_type)}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-sm">{alert.title}</h3>
                                            {alert.message && (
                                                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                            )}
                                        </div>
                                        {!alert.read && (
                                            <Badge variant="destructive" className="shrink-0">
                                                NEW
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(alert.created_at), 'PPp')}
                                        </p>

                                        <div className="flex gap-2">
                                            {alert.incident_id && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        markAsRead(alert.id);
                                                        navigate(`/ranger/incidents/${alert.incident_id}`);
                                                    }}
                                                    className="border-red-300"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View
                                                </Button>
                                            )}
                                            {!alert.read && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => markAsRead(alert.id)}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Mark Read
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteAlert(alert.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
