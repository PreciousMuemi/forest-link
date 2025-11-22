import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden flex items-center">
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
            }}
          />
        ))}
      </div>

      {/* Subtle Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-overlay" />

      {/* Content */}
      <div className="relative z-20 w-full px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
            Unified Forest Threat Intelligence for Kenya
          </h1>

          {/* Subtext */}
          <p className="mb-10 text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Bringing together NASA FIRMS, SMS alerts, USSD reports, and community submissions into one national coordination platform.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg rounded-lg shadow-medium transition-all duration-300 group"
            >
              Request Access
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-foreground/30 text-foreground hover:bg-foreground/10 font-semibold px-8 py-6 text-lg rounded-lg transition-all duration-300"
            >
              View Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Slideshow Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentImage
                ? 'w-8 bg-accent'
                : 'w-1.5 bg-foreground/40 hover:bg-foreground/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
