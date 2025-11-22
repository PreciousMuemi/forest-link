import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Map } from 'lucide-react';

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
          {/* Main Headline */}
          <h1 className="mb-8 text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-none tracking-tighter animate-fade-in-up text-balance">
            Forest Intelligence
            <br />
            <span className="text-accent inline-block">Command Center</span>
          </h1>

          {/* Subtext */}
          <p className="mb-12 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            Real-time threat monitoring and coordinated ranger response.
          </p>

          {/* Action Button */}
          <div className="flex justify-center items-center animate-fade-in-up [animation-delay:400ms]">
            <Button
              size="lg"
              onClick={() => navigate('/admin')}
              className="bg-accent hover:bg-accent/90 text-foreground font-bold px-10 py-7 text-xl rounded-2xl shadow-lg transition-all duration-300 hover-lift group"
            >
              <Map className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              Access Command Center
            </Button>
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
