import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Camera, Map, AlertTriangle } from 'lucide-react';

// Import hero images
import heroWildfire from '@/assets/hero-wildfire.jpg';
import heroLogging from '@/assets/hero-logging.jpg';
import heroCharcoal from '@/assets/hero-charcoal.jpg';
import heroDrought from '@/assets/hero-drought.jpg';
import heroDeforestation from '@/assets/hero-deforestation.jpg';

const heroImages = [
  heroWildfire,
  heroLogging,
  heroCharcoal,
  heroDrought,
  heroDeforestation,
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const scrollToReporter = () => {
    const reporterSection = document.getElementById('field-reporter');
    if (reporterSection) {
      reporterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slideshow Background */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation: index === currentImage ? 'slideshow 18s ease-in-out infinite' : 'none',
            }}
          />
        ))}
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-overlay" />

      {/* Content */}
      <div className="relative z-20 flex h-full items-center justify-center px-4">
        <div className="max-w-5xl text-center">
          {/* Animated Alert Badge */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border-2 border-accent/40 bg-accent/15 px-6 py-3 backdrop-blur-md animate-fade-in glow-pulse">
            <AlertTriangle className="h-5 w-5 text-accent animate-pulse" />
            <span className="text-base font-bold text-white tracking-wide">
              KENYA FOREST EMERGENCY ALERT NETWORK
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-none tracking-tighter animate-fade-in-up [animation-delay:200ms] text-balance">
            Protect Kenya&apos;s Forests.
            <br />
            <span className="text-accent glow-pulse inline-block">Report. Verify. Reward.</span>
          </h1>

          {/* Subtext */}
          <p className="mb-12 text-xl md:text-2xl lg:text-3xl text-white/95 max-w-4xl mx-auto font-medium leading-relaxed animate-fade-in-up [animation-delay:400ms] text-balance">
            Community-powered forest protection with instant SMS alerts,
            <br className="hidden md:block" />
            AI verification, and rewards for verified reports.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-up [animation-delay:600ms]">
            <Button
              size="lg"
              onClick={scrollToReporter}
              className="bg-accent hover:bg-accent/90 text-foreground font-bold px-10 py-7 text-xl rounded-2xl shadow-government-lg hover:shadow-glow-accent transition-all duration-300 hover-lift group"
            >
              <Camera className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
              Report a Threat
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/admin')}
              className="border-3 border-white text-white hover:bg-white hover:text-primary font-bold px-10 py-7 text-xl rounded-2xl backdrop-blur-sm bg-white/10 transition-all duration-300 hover-lift group"
            >
              <Map className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              View Live Incidents
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-3 gap-10 max-w-4xl mx-auto animate-fade-in [animation-delay:800ms]">
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-sm md:text-base text-white/90 font-medium">Real-time Monitoring</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2 group-hover:scale-110 transition-transform">100%</div>
              <div className="text-sm md:text-base text-white/90 font-medium">Verified Reports</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2 group-hover:scale-110 transition-transform">AI+Blockchain</div>
              <div className="text-sm md:text-base text-white/90 font-medium">Powered Detection</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>

      {/* Slideshow Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentImage
                ? 'w-8 bg-accent'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
