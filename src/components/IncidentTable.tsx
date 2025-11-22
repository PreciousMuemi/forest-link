import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Eye, MapPin, Smartphone, MessageSquare, Satellite, Radio, UserPlus, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BroadcastAlertDialog } from './BroadcastAlertDialog';
import { CommunityResponses } from './CommunityResponses';
import { IncidentChat } from './IncidentChat';

interface Incident {
  id: string;
  threat_type: string;
  severity: string;
  lat: number;
  lon: number;
  timestamp: string;
  verified: boolean;
  image_url?: string;
  description?: string;
  notes?: string;
  source?: string;
  sender_phone?: string;
  assigned_ranger_id?: string | null;
  incident_status?: string;
  eta_minutes?: number | null;
  rangers?: {
    name: string;
    phone_number: string;
  };
}

interface IncidentTableProps {
  incidents: Incident[];
  onUpdate: () => void;
  user: User | null;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export const IncidentTable = ({ incidents, onUpdate, user, selectedIds = [], onToggleSelect, onToggleSelectAll }: IncidentTableProps) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertIncident, setAlertIncident] = useState<Incident | null>(null);

  const handleVerify = async (id: string, verified: boolean) => {
    setIsUpdating(true);
    try {
      // Get incident details first
      const { data: incident, error: fetchError } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update verification status
      const { error } = await supabase
        .from('incidents')
        .update({ verified })
        .eq('id', id);

      if (error) throw error;

      // Send thank you SMS if verifying and phone number exists
      if (verified && incident?.sender_phone) {
        try {
          await supabase.functions.invoke('send-approval-feedback', {
            body: {
              phoneNumber: incident.sender_phone,
              threatType: incident.threat_type,
              incidentId: incident.id
            }
          });
          toast.success('Incident verified! Thank you message sent to reporter.');
        } catch (smsError) {
          console.error('Error sending SMS:', smsError);
          toast.success('Incident verified (SMS notification failed)');
        }
      } else {
        toast.success(verified ? 'Incident verified' : 'Incident marked as unverified');
      }

      onUpdate();
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'sms': return <MessageSquare className="h-3 w-3" />;
      case 'ussd': return <Phone className="h-3 w-3" />;
      case 'satellite': return <Satellite className="h-3 w-3" />;
      case 'pwa': return <Smartphone className="h-3 w-3" />;
      default: return <Smartphone className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'sms': return 'SMS';
      case 'ussd': return 'USSD';
      case 'satellite': return 'Satellite';
      case 'pwa': return 'App';
      default: return 'App';
    }
  };

  const handleOpenAlert = (incident: Incident) => {
    setAlertIncident(incident);
    setAlertDialogOpen(true);
  };

  const handleAssignRanger = async (incidentId: string) => {
    setIsUpdating(true);
    try {
      toast.info('Finding nearest available ranger...');

      const { data, error } = await supabase.functions.invoke('assign-ranger', {
        body: { incident_id: incidentId, auto_assign: true },
      });

      if (error) {
        // Check if function doesn't exist (404)
        if (error.message?.includes('404') || error.message?.includes('not found')) {
          toast.warning('Auto-assign feature not configured. Please assign rangers manually.');
          return;
        }
        throw error;
      }

      if (data?.success) {
        toast.success(data.message || 'Ranger assigned successfully!');
        onUpdate();
      } else {
        toast.error(data?.error || 'Failed to assign ranger');
      }
    } catch (error) {
      console.error('Error assigning ranger:', error);
      toast.error('Auto-assign feature unavailable. Please assign manually.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getIncidentStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      reported: { variant: 'outline', label: 'Reported' },
      assigned: { variant: 'secondary', label: 'Assigned' },
      en_route: { variant: 'default', label: 'En Route' },
      on_scene: { variant: 'destructive', label: 'On Scene' },
      resolved: { variant: 'outline', label: 'Resolved' },
      false_alarm: { variant: 'secondary', label: 'False Alarm' },
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto glass-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-secondary/50">
              {onToggleSelectAll && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.length === incidents.length && incidents.length > 0}
                    onCheckedChange={onToggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead className="text-foreground font-semibold">Type</TableHead>
              <TableHead className="text-foreground font-semibold">Source</TableHead>
              <TableHead className="text-foreground font-semibold">Severity</TableHead>
              <TableHead className="text-foreground font-semibold">Status</TableHead>
              <TableHead className="text-foreground font-semibold">Ranger</TableHead>
              <TableHead className="text-foreground font-semibold">Location</TableHead>
              <TableHead className="text-foreground font-semibold">Date</TableHead>
              <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onToggleSelectAll ? 9 : 8} className="text-center py-8 text-muted-foreground">
                  No incidents reported yet
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow 
                  key={incident.id} 
                  className={`${selectedIds.includes(incident.id) ? 'bg-accent/5 border-l-4 border-l-accent' : ''} hover:bg-secondary/30 transition-colors`}
                >
                  {onToggleSelect && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(incident.id)}
                        onCheckedChange={() => onToggleSelect(incident.id)}
                        aria-label={`Select ${incident.threat_type}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium text-foreground">{incident.threat_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 bg-gradient-card border-primary/20">
                      {getSourceIcon(incident.source)}
                      {getSourceLabel(incident.source)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(incident.severity)} className="font-semibold">
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getIncidentStatusBadge(incident.incident_status || 'reported')}
                  </TableCell>
                  <TableCell>
                    {incident.rangers ? (
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{incident.rangers.name}</div>
                        {incident.eta_minutes && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            ETA: {incident.eta_minutes} min
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <MapPin className="h-3 w-3 text-accent" />
                      {incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(incident.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIncident(incident)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!incident.assigned_ranger_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignRanger(incident.id)}
                        disabled={isUpdating}
                        title="Auto-Assign Ranger"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAlert(incident)}
                      title="Send Community Alert"
                      className="text-primary hover:text-primary"
                    >
                      <Radio className="h-4 w-4" />
                    </Button>
                    {!incident.verified ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerify(incident.id, true)}
                        disabled={isUpdating}
                        title="Mark as Verified"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerify(incident.id, false)}
                        disabled={isUpdating}
                        title="Mark as Unverified"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              {selectedIncident?.threat_type} - {selectedIncident?.severity} severity
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              {selectedIncident.image_url && (
                <img
                  src={selectedIncident.image_url}
                  alt="Incident"
                  className="w-full rounded-lg"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.lat.toFixed(6)}, {selectedIncident.lon.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedIncident.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Source</p>
                <Badge variant="outline" className="gap-1">
                  {getSourceIcon(selectedIncident.source)}
                  {getSourceLabel(selectedIncident.source)}
                </Badge>
              </div>
              {selectedIncident.sender_phone && (
                <div>
                  <p className="text-sm font-medium">Sender Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedIncident.sender_phone}</p>
                </div>
              )}
              {selectedIncident.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
                </div>
              )}
              {selectedIncident.notes && (
                <div>
                  <p className="text-sm font-medium">Admin Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedIncident.notes}</p>
                </div>
              )}

              {/* Community Responses */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Community Responses</h3>
                <CommunityResponses incidentId={selectedIncident.id} />
              </div>

              {/* Coordination Chat */}
              {user && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Coordination Chat</h3>
                  <IncidentChat incidentId={selectedIncident.id} user={user} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Broadcast Alert Dialog */}
      {alertIncident && (
        <BroadcastAlertDialog
          open={alertDialogOpen}
          onOpenChange={setAlertDialogOpen}
          incident={alertIncident}
        />
      )}
    </>
  );
};
