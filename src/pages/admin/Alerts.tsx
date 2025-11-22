import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, RefreshCw, History } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { BroadcastAlertHistory } from '@/components/BroadcastAlertHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const alertTemplates = {
  fire: 'ALERT: Wildfire detected in {location}. Evacuate immediately. Rangers dispatched. Call 999 for emergencies.',
  logging: 'ALERT: Illegal logging activity spotted in {location}. Rangers investigating. Report suspicious activity to authorities.',
  poaching: 'ALERT: Poaching incident reported in {location}. Wildlife protection teams alerted. Stay vigilant.',
  charcoal: 'ALERT: Illegal charcoal production detected in {location}. Environmental crime unit notified.',
  encroachment: 'ALERT: Land encroachment detected in {location}. Survey teams dispatched. Report to local administration.',
};

export default function AdminAlerts() {
  const [alertLogs, setAlertLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('fire');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [radius, setRadius] = useState<string>('5');
  const [selectedIncident, setSelectedIncident] = useState<string>('');
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [logsResponse, incidentsResponse] = await Promise.all([
        supabase
          .from('alert_logs')
          .select('*')
          .order('sent_at', { ascending: false })
          .limit(50),
        supabase
          .from('incidents')
          .select('*')
          .eq('verified', true)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (logsResponse.error) throw logsResponse.error;
      if (incidentsResponse.error) throw incidentsResponse.error;

      setAlertLogs(logsResponse.data || []);
      setIncidents(incidentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load alert data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    try {
      setSending(true);
      
      if (!selectedIncident) {
        toast.error('Please select an incident');
        return;
      }

      const message = customMessage || alertTemplates[selectedTemplate as keyof typeof alertTemplates].replace('{location}', location || 'unknown area');
      
      const { error } = await supabase.functions.invoke('send-broadcast-alert', {
        body: {
          incidentId: selectedIncident,
          message,
          radiusKm: parseFloat(radius)
        }
      });

      if (error) throw error;
      
      toast.success('Alert sent successfully');
      setCustomMessage('');
      setLocation('');
      fetchData();
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error('Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  const loadTemplate = (template: string) => {
    setSelectedTemplate(template);
    setCustomMessage(alertTemplates[template as keyof typeof alertTemplates]);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">SMS Alert Center</h2>
          <p className="text-muted-foreground">Send mass alerts to rangers and communities</p>
        </div>
        <Button onClick={fetchData} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="send" className="gap-2">
            <Send className="h-4 w-4" />
            Send Alert
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Alert
            </CardTitle>
            <CardDescription>Broadcast alerts to affected areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Incident</Label>
              <Select value={selectedIncident} onValueChange={setSelectedIncident}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose incident..." />
                </SelectTrigger>
                <SelectContent>
                  {incidents.map((incident) => (
                    <SelectItem key={incident.id} value={incident.id}>
                      {incident.threat_type} - {incident.severity} ({new Date(incident.timestamp).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert Template</Label>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(alertTemplates).map((template) => (
                  <Button
                    key={template}
                    size="sm"
                    variant={selectedTemplate === template ? 'default' : 'outline'}
                    onClick={() => loadTemplate(template)}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location Description</Label>
              <Input
                placeholder="e.g., Aberdare Forest, Section B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Broadcast Radius (km)</Label>
              <Input
                type="number"
                placeholder="5"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                min="1"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Enter your alert message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {customMessage.length} characters (SMS limit: 160)
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSendAlert}
              disabled={sending || !selectedIncident}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Alert'}
            </Button>
          </CardContent>
        </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Recent broadcast performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Alerts Sent</p>
                      <p className="text-2xl font-bold text-primary">{alertLogs.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-primary opacity-50" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recipients Reached</p>
                      <p className="text-2xl font-bold text-success">
                        {alertLogs.reduce((sum, log) => sum + (log.sent_to?.length || 0), 0)}
                      </p>
                    </div>
                    <Send className="h-8 w-8 text-success opacity-50" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Alert</p>
                      <p className="text-sm font-semibold">
                        {alertLogs.length > 0
                          ? new Date(alertLogs[0].sent_at).toLocaleString()
                          : 'No alerts sent'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <BroadcastAlertHistory alertLogs={alertLogs} onRefresh={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
