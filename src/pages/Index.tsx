import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThreatMap from '@/components/ThreatMap';
import SatelliteMap from '@/components/SatelliteMap';
import FieldReporter from '@/components/FieldReporter';
import TestIncidentButton from '@/components/TestIncidentButton';
import { UserJourneyShowcase } from '@/components/UserJourneyShowcase';
import { AlertTriangle, Shield, Leaf, Satellite, Globe, Activity, Zap, Eye, CheckCircle, LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useAdminRole } from '@/hooks/useAdminRole';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { isAdmin, loading: adminLoading } = useAdminRole(user);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  const scrollToMap = () => {
    const mapSection = document.getElementById('satellite-map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      {/* Header with Auth */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {user ? (
          <>
            {!adminLoading && isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user.email}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
            Login / Sign Up
          </Button>
        )}
      </div>
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
              <Button size="lg" variant="secondary" className="gap-2 shadow-lg" onClick={scrollToMap}>
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

      {/* Field Reporter Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                Report Threats from the Field
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground px-4">
                Help protect Kenya's forests by documenting threats in real-time
              </p>
            </div>
            <FieldReporter />
            <div className="mt-4 md:mt-6 text-center">
              <TestIncidentButton />
            </div>
          </div>
        </div>
      </section>

      {/* Live Map Section */}
      <section id="satellite-map-section" className="py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                Live Forest Monitoring
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-muted-foreground px-4">
                Real-time satellite imagery and threat visualization with toggleable layers
              </p>
            </div>
            <SatelliteMap />
          </div>
        </div>
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
