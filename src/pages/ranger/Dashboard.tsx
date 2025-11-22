import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    MapPin,
    Clock,
    CheckCircle,
    Navigation,
    Eye,
    Flame,
    TreeDeciduous,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Incident {
    id: string;
    threat_type: string;
    severity: string;
    lat: number;
    lon: number;
    description: string;
    created_at: string;
    incident_status: string;
    verified: boolean;
    image_url: string | null;
    source: string;
    assigned_ranger: string | null;
    region: string | null;
    verified_at: string | null;
    verified_by: string | null;
    resolved_at: string | null;
    resolved_by: string | null;
    ranger_followup_photos: string[] | null;
    ranger_notes: any[] | null;
}

export default function RangerDashboard() {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');

    useEffect(() => {
        fetchIncidents();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('ranger-incidents')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'incidents',
                },
                () => {
                    fetchIncidents();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [filter]);

    const fetchIncidents = async () => {
        try {
            setLoading(true);

            // Fetch incidents for demo ranger
            let query = supabase
                .from('incidents')
                .select('*')
                .or('assigned_ranger.eq.ranger,region.eq.demo')
                .order('created_at', { ascending: false });

            if (filter === 'active') {
                query = query.neq('incident_status', 'resolved');
            } else if (filter === 'resolved') {
                query = query.eq('incident_status', 'resolved');
            }

            const { data, error } = await query;

            if (error) throw error;

            setIncidents(data || []);
            console.debug('[RangerDashboard] Incidents loaded', {
                total: data?.length || 0,
                filter,
            });
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast.error('Failed to load incidents');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'en_route':
            case 'on_scene':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'assigned':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'false_alarm':
                return 'bg-gray-100 text-gray-600 border-gray-300';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return 'bg-red-600 text-white';
            case 'medium':
                return 'bg-orange-500 text-white';
            case 'low':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getThreatIcon = (threatType: string) => {
        if (threatType.toLowerCase().includes('fire')) {
            return <Flame className="h-5 w-5" />;
        }
        return <TreeDeciduous className="h-5 w-5" />;
    };

    const activeCount = incidents.filter(i => i.incident_status !== 'resolved' && i.incident_status !== 'false_alarm').length;
    const resolvedCount = incidents.filter(i => i.incident_status === 'resolved').length;
    const highSeverityCount = incidents.filter(i =>
        (i.severity === 'high' || i.severity === 'critical') && i.incident_status !== 'resolved' && i.incident_status !== 'false_alarm'
    ).length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-[#3C0D0D] to-[#7A1E07] border border-[#FF7043]/40 text-[#FFE0D1] shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#FFCCBC]/80">Active Incidents</p>
                            <p className="text-3xl font-bold text-white">{activeCount}</p>
                        </div>
                        <AlertTriangle className="h-12 w-12 text-[#FF8A65]" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#4A1504] to-[#B23C17] border border-[#FF8A65]/40 text-[#FFE0D1] shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#FFCCBC]/80">High Priority</p>
                            <p className="text-3xl font-bold text-white">{highSeverityCount}</p>
                        </div>
                        <Flame className="h-12 w-12 text-[#FFCCBC]" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-[#0D3C2D] to-[#17694E] border border-emerald-400/40 text-[#E8FFF9] shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-200/80">Resolved</p>
                            <p className="text-3xl font-bold text-white">{resolvedCount}</p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-emerald-200" />
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={filter === 'active' ? 'default' : 'outline'}
                    onClick={() => setFilter('active')}
                    className={filter === 'active' ? 'bg-[#D32F2F] hover:bg-[#B71C1C]' : 'border-[#FF7043] text-[#B23C17]'}
                >
                    Active ({activeCount})
                </Button>
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-[#D32F2F] hover:bg-[#B71C1C]' : 'border-[#FF7043] text-[#B23C17]'}
                >
                    All ({incidents.length})
                </Button>
                <Button
                    variant={filter === 'resolved' ? 'default' : 'outline'}
                    onClick={() => setFilter('resolved')}
                    className={filter === 'resolved' ? 'bg-[#D32F2F] hover:bg-[#B71C1C]' : 'border-[#FF7043] text-[#B23C17]'}
                >
                    Resolved ({resolvedCount})
                </Button>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
                {loading ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">Loading incidents...</p>
                    </Card>
                ) : incidents.length === 0 ? (
                    <Card className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-semibold">No incidents to display</p>
                        <p className="text-sm text-muted-foreground">All clear in your region!</p>
                    </Card>
                ) : (
                    incidents.map((incident) => (
                        <Card
                            key={incident.id}
                            className="p-6 hover:shadow-2xl transition-shadow cursor-pointer border border-[#FF7043]/30 bg-[#1C0909] text-[#FFE0D1] shadow-government"
                            style={{
                                borderLeftColor:
                                    incident.severity === 'high' || incident.severity === 'critical'
                                        ? '#DC2626'
                                        : incident.severity === 'medium'
                                            ? '#F97316'
                                            : '#84CC16',
                            }}
                            onClick={() => navigate(`/ranger/incidents/${incident.id}`)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className={`p-2 rounded-xl ring-1 ring-white/10 ${getSeverityColor(incident.severity)}`}>
                                            {getThreatIcon(incident.threat_type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{incident.threat_type}</h3>
                                            <p className="text-sm text-[#FFCCBC]/70">
                                                ID: {incident.id.substring(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                        <Badge className={`${getSeverityColor(incident.severity)} border-0 shadow`}>
                                            {incident.severity.toUpperCase()}
                                        </Badge>
                                        <Badge className={`${getStatusColor(incident.incident_status)} border-0 shadow`}>
                                            {incident.incident_status?.replace('_', ' ').toUpperCase() || 'REPORTED'}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-[#FFE0D1]/80 line-clamp-2">
                                        {incident.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-[#FFCCBC]/70 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>
                                                {incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{format(new Date(incident.created_at), 'MMM d, h:mm a')}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs bg-[#260B0B] text-[#FFCCBC] border border-[#FF7043]/40">
                                            {incident.source.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                {incident.image_url && (
                                    <img
                                        src={incident.image_url}
                                        alt="Incident"
                                        className="w-24 h-24 rounded-lg object-cover"
                                    />
                                )}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                            `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lon}`,
                                            '_blank'
                                        );
                                    }}
                                    className="border-[#FF7043] text-[#FFCCBC] hover:bg-[#2A0D0D]"
                                >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Navigate
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/ranger/incidents/${incident.id}`);
                                    }}
                                    className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
