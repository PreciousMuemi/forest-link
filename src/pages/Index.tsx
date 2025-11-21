import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThreatMap from '@/components/ThreatMap';
import SatelliteMap from '@/components/SatelliteMap';
import FieldReporter from '@/components/FieldReporter';
import TestIncidentButton from '@/components/TestIncidentButton';
import { UserJourneyShowcase } from '@/components/UserJourneyShowcase';
import { ThreatGallery } from '@/components/ThreatGallery';
import { SMSInstructions } from '@/components/SMSInstructions';
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
      {/* Hero Section - Fresh Light Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxZmM4NzEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptLTggNGMwIDIuMjEtMS43OSA0LTQgNHMtNC0xLjc5LTQtNCAxLjc5LTQgNC00IDQgMS43OSA0IDR6bTI0IDhjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0em0tOCA4YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-primary/20 shadow-soft mb-4">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">AI-Powered Forest Protection</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              ForestGuard <span className="text-primary">AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Real-time satellite monitoring and ML-powered threat detection to protect our forests from deforestation and wildfires. Powered by blockchain verification.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" className="gap-2 shadow-lg bg-primary hover:bg-primary/90 text-white" onClick={scrollToMap}>
                <Eye className="h-5 w-5" />
                View Live Feed
              </Button>
              <TestIncidentButton />
            </div>

            {/* Stats Row - Clean & Modern */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-border shadow-soft">
                <div className="text-4xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground mt-1">Monitoring</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-border shadow-soft">
                <div className="text-4xl font-bold text-accent">Global</div>
                <div className="text-sm text-muted-foreground mt-1">Coverage</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-border shadow-soft">
                <div className="text-4xl font-bold text-primary">AI</div>
                <div className="text-sm text-muted-foreground mt-1">Powered</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-border shadow-soft">
                <div className="text-4xl font-bold text-accent">Verified</div>
                <div className="text-sm text-muted-foreground mt-1">Blockchain</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Clean & Light */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 border-transparent hover:border-destructive/20">
            <div className="flex items-start justify-between mb-6">
              <div className="bg-destructive/10 p-4 rounded-2xl">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <div className="bg-destructive/10 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-destructive">LIVE</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Threats</h3>
            <p className="text-3xl font-bold text-foreground mb-2">Real-time</p>
            <p className="text-sm text-muted-foreground">Continuous monitoring & instant detection</p>
          </Card>
          
          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 border-transparent hover:border-primary/20">
            <div className="flex items-start justify-between mb-6">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Blockchain</h3>
            <p className="text-3xl font-bold text-foreground mb-2">Sepolia</p>
            <p className="text-sm text-muted-foreground">Immutable verification & transparency</p>
          </Card>
          
          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 border-transparent hover:border-success/20">
            <div className="flex items-start justify-between mb-6">
              <div className="bg-success/10 p-4 rounded-2xl">
                <Zap className="h-7 w-7 text-success" />
              </div>
              <Activity className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Instant Alerts</h3>
            <p className="text-3xl font-bold text-foreground mb-2">WhatsApp</p>
            <p className="text-sm text-muted-foreground">Immediate notifications to authorities</p>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 border-transparent hover:border-accent/20">
            <div className="flex items-start justify-between mb-6">
              <div className="bg-accent/10 p-4 rounded-2xl">
                <Satellite className="h-7 w-7 text-accent" />
              </div>
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Coverage</h3>
            <p className="text-3xl font-bold text-foreground mb-2">Global</p>
            <p className="text-sm text-muted-foreground">Worldwide satellite monitoring</p>
          </Card>
        </div>
      </section>

      {/* Field Reporter Section - Light & Clean */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Kenya Forest Emergency Alert Network
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Multi-channel threat reporting system - works on any device, anywhere
              </p>
            </div>
            
            {/* SMS Instructions */}
            <SMSInstructions />
            
            {/* Field Reporter */}
            <FieldReporter />
            
            <div className="mt-6 text-center">
              <TestIncidentButton />
            </div>
          </div>
        </div>
      </section>

      {/* Threat Gallery Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <ThreatGallery />
          </div>
        </div>
      </section>

      {/* Live Map Section - Modern Light Design */}
      <section id="satellite-map-section" className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Live Forest Monitoring
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Real-time satellite imagery and threat visualization with toggleable layers
              </p>
            </div>
            <SatelliteMap />
          </div>
        </div>
      </section>

      {/* Threat List - Clean Card Design */}
      <section className="container mx-auto px-4 py-12 pb-20">
        <Card className="overflow-hidden shadow-lg border-2 border-border bg-white">
          <div className="bg-gradient-to-r from-destructive/5 to-accent/5 p-8 border-b-2 border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
                  <div className="bg-destructive/10 p-3 rounded-xl">
                    <Activity className="h-7 w-7 text-destructive" />
                  </div>
                  Active Threats
                </h2>
                <p className="text-sm text-muted-foreground">
                  Detected incidents, alerts, and real-time threat monitoring dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-muted/20">
            <ThreatMap />
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Index;
