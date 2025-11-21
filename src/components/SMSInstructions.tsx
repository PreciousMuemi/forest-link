import { Card } from '@/components/ui/card';
import { MessageSquare, Satellite, Smartphone, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SMSInstructions = () => {
  return (
    <Card className="p-6 space-y-4 bg-gradient-to-br from-card to-accent/5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Multi-Channel Reporting</h3>
          <p className="text-sm text-muted-foreground">Report threats from any device</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* SMS Channel */}
        <div className="p-4 rounded-lg border bg-card/50">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-sm">SMS Reports (Basic Phones)</h4>
                <Badge variant="secondary" className="text-xs">No Internet Required</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Send a text message in the format:
              </p>
              <div className="space-y-1">
                <code className="text-xs bg-muted px-2 py-1 rounded block">FIRE [location]</code>
                <code className="text-xs bg-muted px-2 py-1 rounded block">LOGGING [location]</code>
                <code className="text-xs bg-muted px-2 py-1 rounded block">CHARCOAL [location]</code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Example: <span className="font-mono">FIRE Kinale Forest</span>
              </p>
            </div>
          </div>
        </div>

        {/* App Channel */}
        <div className="p-4 rounded-lg border bg-card/50">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-sm">Mobile App (Smartphones)</h4>
                <Badge variant="secondary" className="text-xs">Works Offline</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Take photos, auto-detect GPS location, get AI-powered threat analysis, and sync when back online.
              </p>
            </div>
          </div>
        </div>

        {/* Satellite Channel */}
        <div className="p-4 rounded-lg border bg-card/50">
          <div className="flex items-start gap-3">
            <Satellite className="h-5 w-5 text-purple-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-sm">Satellite Detection (NASA FIRMS)</h4>
                <Badge variant="secondary" className="text-xs">Automatic</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatic fire hotspot detection from NASA satellites. Updates every 3 hours with real-time thermal anomalies.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">For Admins:</span> Configure the Twilio webhook URL in your Twilio console to point to your edge function endpoint for SMS reports.
        </p>
      </div>
    </Card>
  );
};