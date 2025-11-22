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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-medium text-white">
              Kenya Forest Emergency Alert Network
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-4 text-5xl md:text-7xl font-bold text-white leading-tight animate-fade-in-up [animation-delay:200ms]">
            Protect Kenya's Forests.
            <br />
            <span className="text-accent">Report. Verify. Reward.</span>
          </h1>

          {/* Subtext */}
          <p className="mb-10 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light animate-fade-in-up [animation-delay:400ms]">
            Community-powered forest protection with instant SMS alerts,
            <br />
            AI verification, and rewards for verified reports.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up [animation-delay:600ms]">
            <Button
              size="lg"
              onClick={scrollToReporter}
              className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-government-lg hover:shadow-glow-accent transition-all duration-300 hover:scale-105 group"
            >
              <Camera className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Report a Threat
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/admin')}
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-6 text-lg rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300 hover:scale-105 group"
            >
              <Map className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              View Live Incidents
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in [animation-delay:800ms]">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary">24/7</div>
              <div className="text-sm text-white/80 mt-1">Real-time Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary">100%</div>
              <div className="text-sm text-white/80 mt-1">Verified Reports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary">AI+Blockchain</div>
              <div className="text-sm text-white/80 mt-1">Powered Detection</div>
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
