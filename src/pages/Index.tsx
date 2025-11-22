import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import ThreatMap from '@/components/ThreatMap';
import FieldReporter from '@/components/FieldReporter';
import TestIncidentButton from '@/components/TestIncidentButton';
import { ThreatGallery } from '@/components/ThreatGallery';
import { ForestAmbiance } from '@/components/ForestAmbiance';
import {
  AlertTriangle,
  Shield,
  Leaf,
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
    <div className="min-h-screen bg-background relative">
      <ForestAmbiance />
      <OfflineIndicator />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl shadow-soft">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center glow-pulse">
              <Leaf className="h-6 w-6 text-white transform group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">ForestWatch KE</h2>
              <p className="text-xs text-muted-foreground font-medium">Kenya Forest Service</p>
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
      <section className="py-20 px-4 bg-gradient-card relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
              Government-Grade Forest Protection
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Advanced AI and satellite technology empowering Kenya&apos;s communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Activity,
                title: 'Real-Time Monitoring',
                description: 'Live NASA FIRMS satellite feeds with AI-powered threat detection',
                color: 'text-accent',
              },
              {
                icon: Lock,
                title: 'Blockchain Verified',
                description: 'Immutable records on Scroll blockchain ensure transparency',
                color: 'text-primary',
              },
              {
                icon: Bell,
                title: "Africa's Talking SMS",
                description: 'Instant SMS alerts reach communities within seconds via AT',
                color: 'text-accent',
              },
              {
                icon: Globe,
                title: 'Reward System',
                description: 'Earn points and rewards for verified environmental reports',
                color: 'text-success',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-government-lg transition-all duration-500 hover-lift glass-card border-border/50 animate-scale-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-soft group-hover:shadow-glow transition-all duration-300 ${feature.color}`}>
                  <feature.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Field Reporter Section */}
      <section id="field-reporter" className="py-24 px-4 bg-background relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border-2 border-accent/30 mb-6 backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 text-accent animate-pulse" />
              <span className="text-sm font-bold text-accent tracking-wide">COMMUNITY REPORTING</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
              Report Environmental Threats
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your eyes on the ground. Snap a photo, share your location, and help protect our forests.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-government-lg border-2 border-primary/10 glass-card">
              <FieldReporter />
            </Card>
          </div>

        </div>
      </section>

      {/* Verified Threats Gallery */}
      <section className="py-24 px-4 bg-gradient-card relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-success/10 border-2 border-success/30 mb-6 backdrop-blur-sm">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm font-bold text-success tracking-wide">COMMUNITY REPORTS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
              Community Threat Reports
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real incidents reported by community members. Verified reports are displayed after admin approval.
            </p>
          </div>
          <ThreatGallery />
        </div>
      </section>

      {/* Interactive Threat Map */}
      <section className="py-24 px-4 bg-background relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border-2 border-accent/30 mb-6 backdrop-blur-sm">
              <MapIcon className="h-5 w-5 text-accent" />
              <span className="text-sm font-bold text-accent tracking-wide">INTERACTIVE MAP</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
              All Reported Incidents
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Click on any marker to view incident details and community responses
            </p>
          </div>

          <Card className="overflow-hidden shadow-government-lg border-2 border-accent/10 glass-card">
            <ThreatMap />
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-gradient-primary text-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight animate-fade-in-up">
            Join Kenya&apos;s Forest Protection Network
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Every verified report earns you points. Redeem for airtime, data bundles, and more!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-foreground font-bold shadow-glow-accent hover-lift text-lg px-8 py-6"
            >
              <User className="mr-2 h-5 w-5" />
              Create Account & Earn Points
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/admin')}
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold hover-lift text-lg px-8 py-6"
            >
              <Eye className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gradient-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">ForestWatch KE</h3>
                  <p className="text-xs text-muted-foreground">Kenya Forest Service</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Community-powered forest protection with AI, NASA FIRMS, and Africa's Talking SMS.
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
            <p>© 2025 ForestWatch KE - Kenya Forest Emergency Alert Network. All rights reserved.</p>
            <p className="mt-2">Built for 🇰🇪 Kenya | Powered by NASA FIRMS, Africa's Talking & Scroll Blockchain</p>
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
