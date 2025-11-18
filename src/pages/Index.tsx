import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThreatMap from '@/components/ThreatMap';
import SatelliteMap from '@/components/SatelliteMap';
import FieldReporter from '@/components/FieldReporter';
import TestIncidentButton from '@/components/TestIncidentButton';
import { AlertTriangle, Shield, Leaf, Satellite, Globe, Activity, Zap, Eye, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptLTggNGMwIDIuMjEtMS43OSA0LTQgNHMtNC0xLjc5LTQtNCAxLjc5LTQgNC00IDQgMS43OSA0IDR6bTI0IDhjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0em0tOCA4YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
              <Leaf className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Forest Protection</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              ForestGuard AI
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Real-time satellite monitoring and ML-powered threat detection to protect our forests from deforestation and wildfires. Powered by blockchain verification.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
                <Eye className="h-5 w-5" />
                View Live Feed
              </Button>
              <TestIncidentButton />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">24/7</div>
                <div className="text-sm text-primary-foreground/80">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">Global</div>
                <div className="text-sm text-primary-foreground/80">Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">AI</div>
                <div className="text-sm text-primary-foreground/80">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">Verified</div>
                <div className="text-sm text-primary-foreground/80">Blockchain</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-destructive bg-gradient-to-br from-card to-card/80">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-destructive/10 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="bg-destructive/5 px-2 py-1 rounded-full">
                <span className="text-xs font-bold text-destructive">LIVE</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Active Threats</h3>
            <p className="text-2xl font-bold text-foreground">Real-time</p>
            <p className="text-xs text-muted-foreground mt-2">Continuous monitoring & instant detection</p>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary bg-gradient-to-br from-card to-card/80">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Blockchain</h3>
            <p className="text-2xl font-bold text-foreground">Sepolia</p>
            <p className="text-xs text-muted-foreground mt-2">Immutable verification & transparency</p>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-success bg-gradient-to-br from-card to-card/80">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-success/10 p-3 rounded-xl">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <Activity className="h-5 w-5 text-success animate-pulse" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Instant Alerts</h3>
            <p className="text-2xl font-bold text-foreground">WhatsApp</p>
            <p className="text-xs text-muted-foreground mt-2">Immediate notifications to authorities</p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-accent bg-gradient-to-br from-card to-card/80">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-accent/30 p-3 rounded-xl">
                <Satellite className="h-6 w-6 text-primary" />
              </div>
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Coverage</h3>
            <p className="text-2xl font-bold text-foreground">Global</p>
            <p className="text-xs text-muted-foreground mt-2">Worldwide satellite monitoring</p>
          </Card>
        </div>
      </section>

      {/* Field Reporter */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">Field Reporter</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload ground-level photos for instant ML analysis. Help us protect forests by reporting threats directly from the field.
            </p>
          </div>
          <FieldReporter />
        </div>
      </section>

      {/* Satellite Map */}
      <section className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  Real-Time Satellite Imagery
                </h2>
                <p className="text-sm text-muted-foreground">
                  Live satellite feed with ML-powered threat detection and geolocation tracking
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-xs font-semibold text-success">LIVE FEED</span>
              </div>
            </div>
          </div>
          <div className="p-0">
            <SatelliteMap />
          </div>
        </Card>
      </section>

      {/* Threat List */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className="bg-gradient-to-r from-destructive/5 to-warning/5 p-6 border-b">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
                  <div className="bg-destructive/10 p-2 rounded-lg">
                    <Activity className="h-6 w-6 text-destructive" />
                  </div>
                  Active Threats
                </h2>
                <p className="text-sm text-muted-foreground">
                  Detected incidents, alerts, and real-time threat monitoring dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ThreatMap />
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Index;
