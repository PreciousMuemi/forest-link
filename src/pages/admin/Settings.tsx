import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw, Key, MapPin, MessageSquare, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [blockchainEnabled, setBlockchainEnabled] = useState(false);
  const [autoVerify, setAutoVerify] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure system preferences and integrations</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys & Tokens
            </CardTitle>
            <CardDescription>Manage external service integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mapbox Access Token</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="pk.ey..." disabled value="****configured****" />
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Used for map rendering and geocoding services
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Twilio / Africa's Talking</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="Account SID..." disabled value="****configured****" />
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                SMS and voice call capabilities
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>NASA FIRMS API Key</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="NASA API Key..." disabled value="****configured****" />
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Satellite fire hotspot data access
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Region Configuration
            </CardTitle>
            <CardDescription>Define monitoring boundaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Default Center Latitude</Label>
                <Input type="number" placeholder="-0.0236" step="0.0001" />
              </div>
              <div className="space-y-2">
                <Label>Default Center Longitude</Label>
                <Input type="number" placeholder="37.9062" step="0.0001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Monitoring Radius (km)</Label>
              <Input type="number" placeholder="100" />
              <p className="text-xs text-muted-foreground">
                Default radius for incident broadcasts
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Blockchain
            </CardTitle>
            <CardDescription>Configure data integrity features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Blockchain Logging</Label>
                <p className="text-xs text-muted-foreground">
                  Store incident hashes on Ethereum Sepolia testnet
                </p>
              </div>
              <Switch
                checked={blockchainEnabled}
                onCheckedChange={setBlockchainEnabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-verify Satellite Incidents</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically mark NASA FIRMS data as verified
                </p>
              </div>
              <Switch
                checked={autoVerify}
                onCheckedChange={setAutoVerify}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS & USSD Configuration
            </CardTitle>
            <CardDescription>Configure messaging channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>USSD Short Code</Label>
              <Input placeholder="*384*911#" disabled value="*384*911#" />
              <p className="text-xs text-muted-foreground">
                Dial code for USSD incident reporting
              </p>
            </div>

            <div className="space-y-2">
              <Label>SMS Webhook URL</Label>
              <Input 
                disabled 
                value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sms-webhook`}
              />
              <p className="text-xs text-muted-foreground">
                Configure this URL in your Twilio/Africa's Talking dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
