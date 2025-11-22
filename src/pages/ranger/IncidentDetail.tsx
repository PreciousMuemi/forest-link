import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Navigation,
    Camera,
    FileText,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Image as ImageIcon,
    User,
    Phone,
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
    verified_at: string | null;
    verified_by: string | null;
    resolved_at: string | null;
    resolved_by: string | null;
    ranger_followup_photos: string[] | null;
    ranger_notes: any[] | null;
    sender_phone: string | null;
    assigned_ranger: string | null;
    region: string | null;
}

export default function RangerIncidentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            fetchIncident();
        }
    }, [id]);

    const fetchIncident = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('incidents')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setIncident({
                    ...data,
                    ranger_followup_photos: data.ranger_followup_photos || [],
                    ranger_notes: data.ranger_notes || [],
                });
            }
        } catch (error) {
            console.error('Error fetching incident:', error);
            toast.error('Failed to load incident details');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!incident) return;

        try {
            setUpdating(true);

            const updates: any = {
                incident_status: newStatus,
            };

            if (newStatus === 'verified' && !incident.verified) {
                updates.verified = true;
                updates.verified_by = 'ranger-demo@example.com';
                updates.verified_at = new Date().toISOString();
            }

            if (newStatus === 'resolved') {
                updates.resolved_by = 'ranger-demo@example.com';
                updates.resolved_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('incidents')
                .update(updates)
                .eq('id', incident.id);

            if (error) throw error;

            toast.success(`Incident marked as ${newStatus.replace('_', ' ')}`);
            fetchIncident();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !incident) return;

        try {
            setUploading(true);

            // Sanitize filename
            const timestamp = Date.now();
            const sanitizedName = file.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9.]/g, '_')
                .substring(0, 100);
            const fileName = `${timestamp}-${sanitizedName}`;
            const filePath = `ranger-followups/${incident.id}/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('incident-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('incident-images')
                .getPublicUrl(filePath);

            // Update incident with new photo
            const updatedPhotos = [...(incident.ranger_followup_photos || []), publicUrl];

            const { error: updateError } = await supabase
                .from('incidents')
                .update({ ranger_followup_photos: updatedPhotos })
                .eq('id', incident.id);

            if (updateError) throw updateError;

            toast.success('Follow-up photo uploaded successfully');
            fetchIncident();
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error('Failed to upload photo');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const addNote = async () => {
        if (!incident || !noteText.trim()) return;

        try {
            const newNote = {
                note: noteText.trim(),
                timestamp: new Date().toISOString(),
                author: 'ranger-demo@example.com',
            };

            const updatedNotes = [...(incident.ranger_notes || []), newNote];

            const { error } = await supabase
                .from('incidents')
                .update({ ranger_notes: updatedNotes })
                .eq('id', incident.id);

            if (error) throw error;

            toast.success('Field note added');
            setNoteText('');
            setNoteDialogOpen(false);
            fetchIncident();
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Failed to add note');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!incident) {
        return (
            <Card className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Incident Not Found</h2>
                <Button onClick={() => navigate('/ranger')} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
            </Card>
        );
    }

    const statusTimeline = [
        { status: 'reported', label: 'Reported', timestamp: incident.created_at, completed: true },
        {
            status: 'verified',
            label: 'Verified',
            timestamp: incident.verified_at,
            completed: incident.verified,
        },
        {
            status: 'in_progress',
            label: 'In Progress',
            timestamp: null,
            completed: incident.incident_status === 'in_progress' || incident.incident_status === 'resolved',
        },
        {
            status: 'resolved',
            label: 'Resolved',
            timestamp: incident.resolved_at,
            completed: incident.incident_status === 'resolved',
        },
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate('/ranger')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
                <Badge
                    className={
                        incident.severity === 'high' || incident.severity === 'critical'
                            ? 'bg-red-600'
                            : incident.severity === 'medium'
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                    }
                >
                    {incident.severity.toUpperCase()} SEVERITY
                </Badge>
            </div>

            {/* Main Info Card */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold text-red-900">{incident.threat_type}</h1>
                        <p className="text-sm text-muted-foreground">
                            ID: {incident.id.substring(0, 8).toUpperCase()}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span>
                                {incident.lat.toFixed(6)}, {incident.lon.toFixed(6)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span>{format(new Date(incident.created_at), 'PPpp')}</span>
                        </div>
                        {incident.sender_phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-red-600" />
                                <span>{incident.sender_phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-red-600" />
                            <span>Source: {incident.source.toUpperCase()}</span>
                        </div>
                    </div>


                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{incident.description}</p>
                    </div>
                </div>
            </Card>

            {/* Status Timeline */}
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Status Timeline</h2>
                <div className="space-y-4">
                    {statusTimeline.map((item, index) => (
                        <div key={item.status} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                >
                                    {item.completed && <CheckCircle className="h-5 w-5 text-white" />}
                                </div>
                                {index < statusTimeline.length - 1 && (
                                    <div className={`w-0.5 h-12 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <p className="font-semibold">{item.label}</p>
                                {item.timestamp && (
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(item.timestamp), 'PPpp')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                        onClick={() =>
                            window.open(
                                `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lon}`,
                                '_blank'
                            )
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                    </Button>

                    {!incident.verified && (
                        <Button
                            onClick={() => updateStatus('verified')}
                            disabled={updating}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Verify
                        </Button>
                    )}

                    {incident.verified && incident.incident_status !== 'in_progress' && incident.incident_status !== 'resolved' && (
                        <Button
                            onClick={() => updateStatus('in_progress')}
                            disabled={updating}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                            In Progress
                        </Button>
                    )}

                    {incident.incident_status !== 'resolved' && (
                        <Button
                            onClick={() => updateStatus('resolved')}
                            disabled={updating}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Resolve
                        </Button>
                    )}

                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        variant="outline"
                        className="border-red-300"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                        Add Photo
                    </Button>

                    <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-red-300">
                                <FileText className="h-4 w-4 mr-2" />
                                Add Note
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Field Note</DialogTitle>
                                <DialogDescription>Document your observations and actions taken.</DialogDescription>
                            </DialogHeader>
                            <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Enter your field notes here..."
                                rows={5}
                            />
                            <Button onClick={addNote} disabled={!noteText.trim()} className="bg-red-600 hover:bg-red-700">
                                Save Note
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                />
            </Card>

            {/* Photos */}
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Evidence Photos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {incident.image_url && (
                        <div className="space-y-2">
                            <img
                                src={incident.image_url}
                                alt="Initial report"
                                className="w-full h-40 object-cover rounded-lg border-2 border-red-300"
                            />
                            <p className="text-xs text-center text-muted-foreground">Initial Report</p>
                        </div>
                    )}
                    {incident.ranger_followup_photos?.map((photo, index) => (
                        <div key={index} className="space-y-2">
                            <img
                                src={photo}
                                alt={`Follow-up ${index + 1}`}
                                className="w-full h-40 object-cover rounded-lg border-2 border-green-300"
                            />
                            <p className="text-xs text-center text-muted-foreground">Follow-up {index + 1}</p>
                        </div>
                    ))}
                </div>
                {!incident.image_url && (!incident.ranger_followup_photos || incident.ranger_followup_photos.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">No photos available</p>
                )}
            </Card>

            {/* Field Notes */}
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Field Notes
                </h2>
                <div className="space-y-3">
                    {incident.ranger_notes && incident.ranger_notes.length > 0 ? (
                        incident.ranger_notes.map((note, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                <p className="text-sm mb-2">{note.note}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>{note.author}</span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>{format(new Date(note.timestamp), 'PPp')}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No field notes yet</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
