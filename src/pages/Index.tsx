import { Card } from '@/components/ui/card';
import ThreatMap from '@/components/ThreatMap';
import TestIncidentButton from '@/components/TestIncidentButton';
import { AlertTriangle, Shield, Leaf } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ForestGuard AI</h1>
                <p className="text-sm text-muted-foreground">Real-time Threat Detection System</p>
              </div>
            </div>
            <TestIncidentButton />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Threats</p>
                <p className="text-2xl font-bold">Real-time</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blockchain Verified</p>
                <p className="text-2xl font-bold">Sepolia</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alert System</p>
                <p className="text-2xl font-bold">WhatsApp</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Map */}
        <ThreatMap />
      </div>
    </div>
  );
};

export default Index;
