import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThreatMap from '@/components/ThreatMap';
import {
  Shield,
  Zap,
  Target,
  Activity,
  Satellite,
  Smartphone,
  MessageSquare,
  Users,
  CheckCircle,
  LogOut,
  User,
  AlertTriangle,
  Radio,
  TrendingUp,
  Clock,
  Eye,
  ShieldCheck,
  ArrowRight
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
      <OfflineIndicator />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Shield className="h-5 w-5 text-primary-foreground transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-base">KFS Command</h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Threat Intelligence</p>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/20 mb-8 animate-fade-in">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">System Online • Real-time Monitoring Active</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground tracking-tight animate-fade-in-up">
              One Dashboard for All
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-glow mt-2">
                Forest Threats
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Unify NASA satellite alerts, SMS reports, USSD inputs, and community data into a single command center for faster ranger response.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up mb-16">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold shadow-glow h-14 px-8 text-lg group"
              >
                Request Access
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/admin')}
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 font-bold h-14 px-8 text-lg"
              >
                View Demo
              </Button>
            </div>

            {/* Data Source Pills */}
            <div className="flex flex-wrap gap-3 justify-center items-center text-sm text-muted-foreground">
              <span className="font-medium">Data Sources:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                <Satellite className="h-4 w-4 text-accent" />
                <span>NASA FIRMS</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>SMS</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                <Smartphone className="h-4 w-4 text-accent" />
                <span>USSD</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                <Users className="h-4 w-4 text-primary" />
                <span>Web Portal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Map Preview */}
      <section className="py-16 px-6 bg-card/30 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Live Threat Intelligence Map
            </h2>
            <p className="text-muted-foreground">Real-time visualization of all incident sources across Kenya</p>
          </div>

          <Card className="overflow-hidden shadow-2xl border-2 border-primary/20 bg-card">
            <ThreatMap />
          </Card>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="py-24 px-6 bg-background relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why KFS Command Center
            </h2>
            <p className="text-muted-foreground text-lg">Built for speed, accuracy, and coordinated response</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Clock,
                title: 'Faster Response',
                description: 'Reduce ranger response time by 70% with automated prioritization and routing',
                color: 'text-primary',
                bgColor: 'bg-primary/10'
              },
              {
                icon: Radio,
                title: 'Unified Alerts',
                description: 'One dashboard for NASA satellites, SMS, USSD, and community reports—no more fragmented data',
                color: 'text-accent',
                bgColor: 'bg-accent/10'
              },
              {
                icon: Target,
                title: 'Smart Prioritization',
                description: 'AI-powered threat scoring identifies critical incidents automatically for immediate action',
                color: 'text-primary',
                bgColor: 'bg-primary/10'
              }
            ].map((value, index) => (
              <Card
                key={index}
                className="p-8 bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl"
              >
                <div className={`h-16 w-16 rounded-xl ${value.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`h-8 w-8 ${value.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-card/30 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">From detection to resolution in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {[
              {
                step: '01',
                icon: Activity,
                title: 'Ingest & Unify',
                description: 'All threat data flows into one system—NASA FIRMS, SMS, USSD, web uploads'
              },
              {
                step: '02',
                icon: Eye,
                title: 'AI Screening',
                description: 'ML models verify, classify, and prioritize threats automatically'
              },
              {
                step: '03',
                icon: Zap,
                title: 'Dispatch Rangers',
                description: 'Assign closest rangers, track ETA, send SMS alerts to community'
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                )}
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-2xl bg-gradient-primary shadow-glow mb-6">
                    <step.icon className="h-12 w-12 text-primary-foreground" />
                  </div>
                  <div className="text-5xl font-bold text-primary/20 mb-4">{step.step}</div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Integration */}
      <section className="py-24 px-6 bg-background relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Plug Into Existing Workflows
            </h2>
            <p className="text-muted-foreground text-lg">Integrates with your current systems and processes</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'NASA FIRMS', icon: Satellite },
              { name: 'Africa\'s Talking', icon: MessageSquare },
              { name: 'Scroll Blockchain', icon: Shield },
              { name: 'Mapbox', icon: Activity }
            ].map((partner, index) => (
              <Card
                key={index}
                className="p-8 bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 text-center group"
              >
                <partner.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-foreground">{partner.name}</h4>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Accuracy */}
      <section className="py-24 px-6 bg-card/30 relative">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 bg-card border-2 border-primary/20 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <ShieldCheck className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Trust & Accuracy</h2>
                    <p className="text-primary font-medium">AI + Human Validation</p>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Our system combines automated AI verification with human review to ensure every alert is accurate. Machine learning reduces false positives by 80%, while KFS personnel maintain final oversight for mission-critical decisions.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { label: 'Accuracy Rate', value: '94%' },
                    { label: 'False Positive Reduction', value: '80%' },
                    { label: 'Average Response Time', value: '18min' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-4 rounded-xl bg-background/50">
                      <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        {/* Animated grid */}
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Centralize Your Threat Intelligence?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join KFS rangers and administrators using the command center to protect Kenya's forests
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-14 px-8 text-lg shadow-glow-accent group"
            >
              Request Access
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/admin')}
              className="border-2 border-primary-foreground/30 hover:border-primary-foreground hover:bg-primary-foreground/10 text-primary-foreground font-bold h-14 px-8 text-lg"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">KFS Command</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Threat Intelligence</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Unified threat intelligence platform for Kenya Forest Service
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Access</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/auth" className="hover:text-primary transition-colors">Sign In</a></li>
                <li><a href="/admin" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="/ranger" className="hover:text-primary transition-colors">Ranger Portal</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Report Threats</h4>
              <p className="text-sm text-muted-foreground mb-2">SMS: Text FIRE to +254...</p>
              <p className="text-sm text-muted-foreground mb-2">USSD: Dial *384*33248#</p>
              <p className="text-sm text-muted-foreground">Web: Use portal above</p>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 KFS Command Center - Kenya Forest Service. All rights reserved.</p>
            <p className="mt-2">Powered by NASA FIRMS • Africa's Talking • Scroll Blockchain</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
