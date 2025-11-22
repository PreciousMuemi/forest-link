import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { IncidentTable } from '@/components/IncidentTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Download, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function AdminIncidents() {
  const [user, setUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [sourceFilter, severityFilter, statusFilter, verificationFilter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('incidents')
        .select(`
          *,
          rangers:assigned_ranger_id (
            name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (sourceFilter !== 'all') query = query.eq('source', sourceFilter);
      if (severityFilter !== 'all') query = query.eq('severity', severityFilter);
      if (statusFilter !== 'all') query = query.eq('incident_status', statusFilter);
      if (verificationFilter === 'verified') query = query.eq('verified', true);
      if (verificationFilter === 'pending') query = query.eq('verified', false);

      const { data, error } = await query;
      if (error) throw error;

      console.log('📊 Admin Incidents:', {
        total: data?.length || 0,
        verified: data?.filter(i => i.verified).length || 0,
        pending: data?.filter(i => !i.verified).length || 0
      });

      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select incidents to approve');
      return;
    }

    setBulkProcessing(true);
    try {
      let successCount = 0;
      let smsCount = 0;

      for (const id of selectedIds) {
        const incident = incidents.find(i => i.id === id);
        if (!incident || incident.verified) continue;

        // Update verification status
        const { error: updateError } = await supabase
          .from('incidents')
          .update({ verified: true })
          .eq('id', id);

        if (updateError) {
          console.error('Error verifying incident:', id, updateError);
          continue;
        }

        successCount++;

        // Send SMS if phone number exists
        if (incident.sender_phone) {
          try {
            await supabase.functions.invoke('send-approval-feedback', {
              body: {
                phoneNumber: incident.sender_phone,
                threatType: incident.threat_type,
                incidentId: incident.id
              }
            });
            smsCount++;
          } catch (smsError) {
            console.error('SMS error for incident:', id, smsError);
          }
        }
      }

      toast.success(`✅ Approved ${successCount} incidents! ${smsCount} SMS notifications sent.`);
      setSelectedIds([]);
      fetchIncidents();
    } catch (error) {
      console.error('Bulk approval error:', error);
      toast.error('Failed to approve some incidents');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select incidents to reject');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} incident(s)? This cannot be undone.`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      toast.success(`🗑️ Rejected and deleted ${selectedIds.length} incidents`);
      setSelectedIds([]);
      fetchIncidents();
    } catch (error) {
      console.error('Bulk reject error:', error);
      toast.error('Failed to reject incidents');
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === incidents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(incidents.map(i => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    try {
      const csv = [
        ['ID', 'Type', 'Severity', 'Status', 'Latitude', 'Longitude', 'Date', 'Verified', 'Description'].join(','),
        ...incidents.map(i => [
          i.id,
          i.threat_type,
          i.severity,
          i.incident_status,
          i.lat,
          i.lon,
          new Date(i.timestamp).toISOString(),
          i.verified ? 'Yes' : 'No',
          `"${(i.description || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forest-incidents-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  const pendingCount = incidents.filter(i => !i.verified).length;
  const verifiedCount = incidents.filter(i => i.verified).length;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Incident Management & Approval</h2>
          <p className="text-muted-foreground">Review and verify community threat reports</p>
          <div className="flex gap-3 mt-3">
            <Badge variant="outline" className="gap-2 px-3 py-1 border-orange-500 text-orange-600">
              <Clock className="h-4 w-4" />
              {pendingCount} Pending Approval
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1 border-success text-success">
              <CheckCircle className="h-4 w-4" />
              {verifiedCount} Verified
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <Badge variant="secondary" className="px-3 py-2">
                {selectedIds.length} selected
              </Badge>
              <Button
                onClick={handleBulkApprove}
                size="sm"
                disabled={bulkProcessing}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected
              </Button>
              <Button
                onClick={handleBulkReject}
                size="sm"
                variant="destructive"
                disabled={bulkProcessing}
              >
                <Clock className="h-4 w-4 mr-2" />
                Reject Selected
              </Button>
            </>
          )}
          <Button onClick={fetchIncidents} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Source:</span>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="pwa">📱 App</SelectItem>
              <SelectItem value="sms">💬 SMS</SelectItem>
              <SelectItem value="ussd">📞 USSD</SelectItem>
              <SelectItem value="satellite">🛰️ Satellite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Severity:</span>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="reported">Reported</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="en_route">En Route</SelectItem>
              <SelectItem value="on_scene">On Scene</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Verification:</span>
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Pending Approval
                </div>
              </SelectItem>
              <SelectItem value="verified">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Verified
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <IncidentTable
        incidents={incidents}
        onUpdate={fetchIncidents}
        user={user}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
      />
    </div>
  );
}
