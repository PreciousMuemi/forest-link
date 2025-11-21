import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import ThreatMap from '@/components/ThreatMap';
import SatelliteMap from '@/components/SatelliteMap';
import FieldReporter from '@/components/FieldReporter';
import TestIncidentButton from '@/components/TestIncidentButton';
import { ThreatGallery } from '@/components/ThreatGallery';
import { SMSInstructions } from '@/components/SMSInstructions';
import { 
  AlertTriangle, 
  Shield, 
  Leaf, 
  Satellite, 
  Globe, 
  Activity, 
  Zap, 
  Eye, 
  CheckCircle, 
  LogOut, 
  User,
  Bell,
  Lock,
  Map as MapIcon
} from 'lucide-react';
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg shadow-soft">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">ForestGuard</h2>
              <p className="text-xs text-muted-foreground">Kenya Forest Service</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {!adminLoading && isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Slideshow */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Government-Grade Environmental Protection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced technology empowering communities to protect Kenya's precious forests
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Activity,
                title: 'Real-Time Monitoring',
                description: 'Live satellite feeds and AI-powered threat detection across all forest regions',
                color: 'text-accent',
              },
              {
                icon: Lock,
                title: 'Blockchain Verified',
                description: 'Immutable records on Scroll blockchain ensure transparency and accountability',
                color: 'text-primary',
              },
              {
                icon: Bell,
                title: 'Instant Alerts',
                description: 'SMS and USSD notifications reach communities within seconds of detection',
                color: 'text-accent',
              },
              {
                icon: Globe,
                title: 'Nationwide Coverage',
                description: 'Protecting forests from Mau to Karura with comprehensive monitoring',
                color: 'text-primary',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-government transition-all duration-300 hover:scale-105 bg-gradient-card border-border/50 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-soft ${feature.color}`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Field Reporter Section */}
      <section id="field-reporter" className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Community Reporting</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Report Environmental Threats
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your eyes on the ground. Snap a photo, share your location, and help protect our forests.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-government-lg border-2 border-primary/10">
              <FieldReporter />
            </Card>
          </div>

          {/* SMS/USSD Instructions */}
          <div className="mt-12 max-w-4xl mx-auto">
            <SMSInstructions />
          </div>
        </div>
      </section>

      {/* Recent Threats Gallery */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Recent Threat Reports
            </h2>
            <p className="text-lg text-muted-foreground">
              Real-time incidents verified by AI and blockchain
            </p>
          </div>
          <ThreatGallery />
        </div>
      </section>

      {/* Satellite Map Section */}
      <section id="satellite-map-section" className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Satellite className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">NASA FIRMS Integration</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Live Satellite Monitoring
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time fire hotspot detection from NASA satellites
            </p>
          </div>
          
          <Card className="overflow-hidden shadow-government-lg border-2 border-primary/10">
            <SatelliteMap />
          </Card>
        </div>
      </section>

      {/* Interactive Threat Map */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
              <MapIcon className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Interactive Map</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              All Reported Incidents
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Click on any marker to view incident details and community responses
            </p>
          </div>
          
          <Card className="overflow-hidden shadow-government-lg border-2 border-accent/10">
            <ThreatMap />
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Forest Protection Network
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Every report matters. Together, we can save Kenya's forests for future generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="accent"
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-white font-semibold shadow-glow-accent"
            >
              <User className="mr-2 h-5 w-5" />
              Create Account
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/admin')}
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold"
            >
              <Eye className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">ForestGuard AI</h3>
                  <p className="text-xs text-muted-foreground">Kenya Forest Service</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Government-grade environmental threat reporting system powered by AI, blockchain, and community action.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/auth" className="hover:text-primary transition-colors">Sign In</a></li>
                <li><a href="/admin" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="/ranger" className="hover:text-primary transition-colors">Ranger Portal</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Emergency Contact</h4>
              <p className="text-sm text-muted-foreground mb-2">SMS: Text FIRE to +254...</p>
              <p className="text-sm text-muted-foreground mb-2">USSD: Dial *384*33248#</p>
              <p className="text-sm text-muted-foreground">24/7 Response Team</p>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 ForestGuard AI - Kenya Forest Emergency Alert Network. All rights reserved.</p>
            <p className="mt-2">Built with 💚 for Kenya's Forests | Wangari Maathai Hackathon 2025</p>
          </div>
        </div>
      </footer>

      {/* Admin Test Button (bottom-right corner) */}
      {!adminLoading && isAdmin && (
        <div className="fixed bottom-4 right-4 z-40">
          <TestIncidentButton />
        </div>
      )}
    </div>
  );
};

export default Index;
