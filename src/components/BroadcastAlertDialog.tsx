import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Radio } from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: {
    id: string;
    threat_type: string;
    severity: string;
    lat: number;
    lon: number;
  };
}

export const BroadcastAlertDialog = ({ open, onOpenChange, incident }: BroadcastAlertDialogProps) => {
  const [radius, setRadius] = useState('5');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    try {
      setIsSending(true);

      const radiusKm = parseFloat(radius);
      if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 50) {
        toast.error('Please enter a valid radius between 1 and 50 km');
        return;
      }

      toast.info('Sending broadcast alert...');

      const { data, error } = await supabase.functions.invoke('send-broadcast-alert', {
        body: {
          incident_id: incident.id,
          radius_km: radiusKm,
          custom_message: customMessage.trim() || undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || 'Alert sent successfully!');
        onOpenChange(false);
        setRadius('5');
        setCustomMessage('');
      } else {
        toast.error(data?.error || 'Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error('Failed to send broadcast alert');
    } finally {
      setIsSending(false);
    }
  };

  const defaultMessage = `⚠️ FOREST ALERT: ${incident.threat_type.toUpperCase()} detected near your location. ${incident.severity.toUpperCase()} severity. Rangers responding. Reply: SAFE, NEED_HELP, or EVACUATING.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-destructive" />
            Send Community Alert
          </DialogTitle>
          <DialogDescription>
            Broadcast SMS alert to community members within the specified radius
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="radius">Alert Radius (km)</Label>
            <Input
              id="radius"
              type="number"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">
              Communities within {radius}km of the incident will be alerted
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Leave blank to use default message"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {customMessage.length}/160 characters
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-xs font-medium mb-2">Default Message:</p>
            <p className="text-xs text-muted-foreground">{defaultMessage}</p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Community members can reply with: <strong>SAFE</strong>, <strong>NEED_HELP</strong>, or <strong>EVACUATING</strong> to update their status.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};