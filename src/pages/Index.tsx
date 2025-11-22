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

  const scrollToReporter = () => {
    const reporterSection = document.getElementById('field-reporter');
    if (reporterSection) {
      reporterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

      {/* Why This Matters Section */}
      <section className="py-16 md:py-20 px-4 bg-background relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why This Matters
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Zap,
                title: 'Faster Response',
                description: 'Real-time alerts enable rangers to respond to threats within minutes, not hours.',
              },
              {
                icon: CheckCircle,
                title: 'Verified Reports',
                description: 'AI screening filters false alarms so rangers focus on real threats.',
              },
              {
                icon: Shield,
                title: 'Community Power',
                description: 'Empowering local communities to report and protect their forests together.',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 md:p-8 hover:shadow-lg transition-all duration-500 hover-lift animate-scale-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-card relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '1',
                icon: AlertTriangle,
                title: 'Report Threat',
                description: 'Community members report via SMS, USSD, web, or satellite detects fire.',
              },
              {
                step: '2',
                icon: Eye,
                title: 'AI Verifies',
                description: 'System analyzes location, severity, and filters false positives automatically.',
              },
              {
                step: '3',
                icon: MapIcon,
                title: 'Rangers Respond',
                description: 'Nearest ranger is dispatched with GPS tracking and real-time updates.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto shadow-lg">
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent flex items-center justify-center text-foreground font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Uses It Section */}
      <section className="py-16 md:py-20 px-4 bg-background relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Who Uses It
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, name: 'Kenya Forest Service', role: 'Command & Control' },
              { icon: User, name: 'Community Scouts', role: 'Field Reporting' },
              { icon: MapIcon, name: 'Forest Rangers', role: 'Response Teams' },
              { icon: Globe, name: 'NGO Partners', role: 'Conservation Support' },
            ].map((user, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-all duration-300 hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <user.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Integrations Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-card relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Unified Data Sources
            </h2>
            <p className="text-muted-foreground">
              All threat intelligence in one place
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, name: 'NASA FIRMS', desc: 'Satellite Fire Data' },
              { icon: Bell, name: 'SMS Alerts', desc: 'Community Reports' },
              { icon: Activity, name: 'USSD', desc: 'Mobile Reports' },
              { icon: Leaf, name: 'Web Portal', desc: 'Direct Submissions' },
            ].map((source, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-all duration-300 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <source.icon className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">{source.name}</h3>
                <p className="text-sm text-muted-foreground">{source.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24 px-4 bg-background relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Live Command Dashboard
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Real-time visualization of all threats, maps, and ranger dispatch status
            </p>
          </div>

          <Card className="overflow-hidden shadow-lg border-2 border-border">
            <ThreatMap />
          </Card>
        </div>
      </section>

      {/* Verified Threats Gallery */}
      <section className="py-16 px-4 bg-gradient-card relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 animate-fade-in-up">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Recent Verified Threats
            </h3>
          </div>
          <ThreatGallery />
        </div>
      </section>

      {/* Field Reporter Section */}
      <section id="field-reporter" className="py-16 md:py-20 px-4 bg-background relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 animate-fade-in-up">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Report a Threat
            </h3>
            <p className="text-sm text-muted-foreground">
              Submit via SMS, USSD, or web form
            </p>
          </div>

          <Card className="p-6 md:p-8 shadow-lg border-2 border-border">
            <FieldReporter />
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 px-4 bg-gradient-primary text-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="container mx-auto text-center relative z-10 max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
            Ready to Protect Kenya's Forests?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-in-up">
            Join the unified threat intelligence network
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Button
              size="lg"
              onClick={() => navigate('/admin')}
              className="bg-accent hover:bg-accent/90 text-foreground font-semibold px-8 py-6 text-lg shadow-lg hover-lift w-full sm:w-auto"
            >
              Request Access
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToReporter}
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-6 text-lg hover-lift w-full sm:w-auto"
            >
              View Demo
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
              <p className="text-sm text-muted-foreground">
                Unified threat intelligence for Kenya Forest Service
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
