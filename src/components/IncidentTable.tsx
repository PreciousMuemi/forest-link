import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, MapPin, Smartphone, MessageSquare, Satellite, Radio } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BroadcastAlertDialog } from './BroadcastAlertDialog';
import { CommunityResponses } from './CommunityResponses';

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
}

interface IncidentTableProps {
  incidents: Incident[];
  onUpdate: () => void;
}

export const IncidentTable = ({ incidents, onUpdate }: IncidentTableProps) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertIncident, setAlertIncident] = useState<Incident | null>(null);

  const handleVerify = async (id: string, verified: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ verified })
        .eq('id', id);

      if (error) throw error;

      toast.success(verified ? 'Incident verified' : 'Incident marked as unverified');
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
      case 'satellite': return <Satellite className="h-3 w-3" />;
      case 'pwa': return <Smartphone className="h-3 w-3" />;
      default: return <Smartphone className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'sms': return 'SMS';
      case 'satellite': return 'Satellite';
      case 'pwa': return 'App';
      default: return 'App';
    }
  };

  const handleOpenAlert = (incident: Incident) => {
    setAlertIncident(incident);
    setAlertDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No incidents reported yet
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.threat_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {getSourceIcon(incident.source)}
                      {getSourceLabel(incident.source)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {incident.lat.toFixed(4)}, {incident.lon.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(incident.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={incident.verified ? 'default' : 'outline'}>
                      {incident.verified ? 'Verified' : 'Pending'}
                    </Badge>
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
