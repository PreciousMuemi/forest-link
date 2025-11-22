import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import FieldReporter from '@/components/FieldReporter';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import {
  Zap,
  CheckCircle,
  Users,
  ArrowRight,
  Satellite,
  MessageSquare,
  Radio,
  Share2,
  MapPin,
  BarChart3,
  Shield,
  TreePine,
  User,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useAdminRole } from '@/hooks/useAdminRole';

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
      <OfflineIndicator />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm shadow-soft">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
              <TreePine className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">ForestWatch KE</h2>
              <p className="text-xs text-muted-foreground">Kenya Forest Service</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {!adminLoading && isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.email?.split('@')[0]}
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Why This Matters Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Why This Matters
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Coordinated action saves forests and communities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-card border-border hover:shadow-medium transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-accent/15 flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Faster Response</h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time alerts reach rangers within minutes, not hours. Early detection means faster containment.
              </p>
            </Card>

            <Card className="p-8 bg-card border-border hover:shadow-medium transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-secondary/15 flex items-center justify-center mb-6">
                <CheckCircle className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Verified Reports</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI screening and community confirmation reduce false alarms, so teams focus on real threats.
              </p>
            </Card>

            <Card className="p-8 bg-card border-border hover:shadow-medium transition-shadow">
              <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Community Power</h3>
              <p className="text-muted-foreground leading-relaxed">
                Empowering local scouts and residents to protect their environment alongside KFS rangers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps from report to response
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Report Received</h3>
              <p className="text-muted-foreground">
                Threats come in via SMS, USSD, satellite data, or web form
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI Verification</h3>
              <p className="text-muted-foreground">
                Automated screening validates location, severity, and threat type
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Ranger Dispatch</h3>
              <p className="text-muted-foreground">
                Nearest available ranger gets alert with map, ETA, and threat details
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Uses It Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Who Uses It
            </h2>
            <p className="text-muted-foreground text-lg">
              Built for collaboration across Kenya's forest protection network
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'KFS Rangers', icon: Shield },
              { title: 'Community Scouts', icon: Users },
              { title: 'Conservation NGOs', icon: TreePine },
              { title: 'Local Residents', icon: MapPin },
            ].map((userType, index) => (
              <Card key={index} className="p-6 text-center bg-card border-border hover:shadow-soft transition-shadow">
                <userType.icon className="h-10 w-10 text-secondary mx-auto mb-4" />
                <h3 className="font-bold text-foreground">{userType.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Integrations Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Unified Data Sources
            </h2>
            <p className="text-muted-foreground text-lg">
              One dashboard, multiple channels
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'NASA FIRMS', subtitle: 'Satellite hotspots', icon: Satellite, color: 'text-accent' },
              { title: 'SMS Reports', subtitle: 'Text to report', icon: MessageSquare, color: 'text-secondary' },
              { title: 'USSD', subtitle: 'Dial *384*33248#', icon: Radio, color: 'text-primary' },
              { title: 'Web & Social', subtitle: 'Community input', icon: Share2, color: 'text-accent' },
            ].map((source, index) => (
              <div key={index} className="text-center">
                <div className={`h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4`}>
                  <source.icon className={`h-8 w-8 ${source.color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-1">{source.title}</h3>
                <p className="text-sm text-muted-foreground">{source.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Command Center Dashboard
            </h2>
            <p className="text-muted-foreground text-lg">
              Live maps, verified reports, and response analytics
            </p>
          </div>

          <Card className="p-8 bg-card border-border shadow-soft">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <MapPin className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Live Threat Map</h3>
                  <p className="text-muted-foreground text-sm">
                    Real-time visualization of all incidents with filtering by type, severity, and status
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <BarChart3 className="h-8 w-8 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Response Analytics</h3>
                  <p className="text-muted-foreground text-sm">
                    Track response times, resolution rates, and identify high-risk zones
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Report Threat Section */}
      <section id="field-reporter" className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
              Report a Threat
            </h3>
            <p className="text-muted-foreground">
              Submit via SMS, USSD, or this form
            </p>
          </div>

          <Card className="p-8 bg-card border-border/50">
            <FieldReporter />
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto text-center relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Join Kenya's Forest Protection Network
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Request access to the command center or view a live demo of the platform in action
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/admin')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-medium group"
            >
              Request Access
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">ForestWatch KE</h3>
                  <p className="text-xs text-muted-foreground">Kenya Forest Service</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                National forest threat coordination platform
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/auth" className="hover:text-accent transition-colors">Sign In</a></li>
                <li><a href="/admin" className="hover:text-accent transition-colors">Dashboard</a></li>
                <li><a href="/ranger" className="hover:text-accent transition-colors">Ranger Portal</a></li>
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
            <p>© 2025 ForestWatch KE - Kenya Forest Service. All rights reserved.</p>
            <p className="mt-2">Built for Kenya | Powered by NASA FIRMS & Community Intelligence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
