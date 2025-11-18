import { Card } from '@/components/ui/card';
import ThreatMap from '@/components/ThreatMap';
import SatelliteMap from '@/components/SatelliteMap';
import FieldReporter from '@/components/FieldReporter';
import TestIncidentButton from '@/components/TestIncidentButton';
import { AlertTriangle, Shield, Leaf, Satellite, Globe, Activity } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-3 rounded-2xl shadow-lg">
                <Leaf className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  ForestGuard AI
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Satellite className="h-3 w-3" />
                  ML-Powered Forest Protection System
                </p>
              </div>
            </div>
            <TestIncidentButton />
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-destructive">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Threats</p>
                <p className="text-3xl font-bold mt-2 text-foreground">Real-time</p>
                <p className="text-xs text-muted-foreground mt-1">Monitoring 24/7</p>
              </div>
              <div className="bg-destructive/10 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blockchain</p>
                <p className="text-3xl font-bold mt-2 text-foreground">Sepolia</p>
                <p className="text-xs text-muted-foreground mt-1">Verified & Immutable</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-success">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alerts</p>
                <p className="text-3xl font-bold mt-2 text-foreground">WhatsApp</p>
                <p className="text-xs text-muted-foreground mt-1">Instant Notifications</p>
              </div>
              <div className="bg-success/10 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-accent">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Coverage</p>
                <p className="text-3xl font-bold mt-2 text-foreground">Global</p>
                <p className="text-xs text-muted-foreground mt-1">Satellite Monitoring</p>
              </div>
              <div className="bg-accent/30 p-3 rounded-xl">
                <Globe className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Field Reporter */}
        <section className="mb-8">
          <FieldReporter />
        </section>

        {/* Satellite Map */}
        <section className="mb-8">
          <Card className="p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Real-Time Satellite Imagery
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Live satellite feed with ML-powered threat detection
              </p>
            </div>
            <SatelliteMap />
          </Card>
        </section>

        {/* Threat List */}
        <section>
          <Card className="p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Active Threats
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Detected incidents and alerts
              </p>
            </div>
            <ThreatMap />
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
