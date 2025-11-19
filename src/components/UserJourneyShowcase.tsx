import { Card } from '@/components/ui/card';
import { Camera, Cpu, Shield, Bell, BarChart3, MapPin } from 'lucide-react';

export const UserJourneyShowcase = () => {
  const steps = [
    {
      icon: Camera,
      title: 'Field Reporter Captures',
      description: 'Community member snaps forest threat with GPS-tagged photo',
      time: '0-10s',
      color: 'text-blue-500',
    },
    {
      icon: Cpu,
      title: 'AI Analysis',
      description: 'ML model classifies threat type, severity, and confidence score',
      time: '10-15s',
      color: 'text-purple-500',
    },
    {
      icon: Shield,
      title: 'Blockchain Logging',
      description: 'Immutable record stored on Scroll testnet with transaction hash',
      time: '15-20s',
      color: 'text-orange-500',
    },
    {
      icon: Bell,
      title: 'Instant Alerts',
      description: 'SMS notifications sent to forest rangers and authorities',
      time: '20-25s',
      color: 'text-red-500',
    },
    {
      icon: MapPin,
      title: 'Map Update',
      description: 'Location marked on real-time satellite map with incident details',
      time: '25-30s',
      color: 'text-green-500',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Analytics',
      description: 'Admin sees trends, exports data, tracks accountability',
      time: '30s+',
      color: 'text-teal-500',
    },
  ];

  return (
    <Card className="p-4 md:p-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Complete User Journey</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
          From threat capture to action in under 60 seconds — empowering communities with AI, blockchain, and real-time monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
              <Card className="relative p-4 md:p-6 h-full hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`${step.color} bg-current/10 p-2 md:p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`h-5 w-5 md:h-6 md:w-6 ${step.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm md:text-base">{step.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{step.time}</span>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <p className="text-center text-sm md:text-base font-medium">
          <span className="text-primary font-bold">Judge-Ready Impact:</span> Community empowerment + AI innovation + Blockchain transparency + Real-time response = Scalable forest conservation
        </p>
      </div>
    </Card>
  );
};
