import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, AlertTriangle, Flame, TreeDeciduous, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ThreatImage {
  id: string;
  type: string;
  imageUrl: string;
  generated: boolean;
}

const threatTypes = [
  { name: 'Fire', icon: Flame, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  { name: 'Deforestation', icon: TreeDeciduous, color: 'text-warning', bgColor: 'bg-warning/10' },
  { name: 'Illegal Logging', icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { name: 'Wildlife Poaching', icon: Shield, color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
];

export const ThreatGallery = () => {
  const [images, setImages] = useState<ThreatImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with placeholder images
    setImages(
      threatTypes.map((type, idx) => ({
        id: `threat-${idx}`,
        type: type.name,
        imageUrl: '',
        generated: false,
      }))
    );
  }, []);

  const generateImage = async (threatType: string, id: string) => {
    setGeneratingId(id);
    try {
      const { data, error } = await supabase.functions.invoke('generate-threat-image', {
        body: { threatType },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? { ...img, imageUrl: data.imageUrl, generated: true }
              : img
          )
        );
        toast.success(`Generated ${threatType} image`);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setGeneratingId(null);
    }
  };

  const generateAllImages = async () => {
    setLoading(true);
    for (const img of images) {
      if (!img.generated) {
        await generateImage(img.type, img.id);
        // Small delay between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Threat Detection Gallery</h2>
          <p className="text-muted-foreground">
            AI-generated examples of forest threats detected by our system
          </p>
        </div>
        <Button
          onClick={generateAllImages}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate Gallery
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img, idx) => {
          const threatInfo = threatTypes[idx];
          const Icon = threatInfo.icon;
          const isGenerating = generatingId === img.id;

          return (
            <Card
              key={img.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-border"
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {img.generated && img.imageUrl ? (
                  <img
                    src={img.imageUrl}
                    alt={`${img.type} threat detection`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : isGenerating ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Generating {img.type} image...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => generateImage(img.type, img.id)}
                      className="gap-2"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Generate {img.type} Image
                    </Button>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${threatInfo.bgColor} ${threatInfo.color} border-0 font-semibold`}>
                    <Icon className="h-4 w-4 mr-1" />
                    {img.type}
                  </Badge>
                </div>
              </div>

              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-foreground mb-2">{img.type} Detection</h3>
                <p className="text-sm text-muted-foreground">
                  {img.type === 'Fire' &&
                    'Real-time monitoring of forest fires with immediate alert systems and response coordination.'}
                  {img.type === 'Deforestation' &&
                    'Satellite imagery analysis detects illegal clearing and logging activities across protected areas.'}
                  {img.type === 'Illegal Logging' &&
                    'AI-powered detection of unauthorized logging operations with GPS tracking and evidence collection.'}
                  {img.type === 'Wildlife Poaching' &&
                    'Conservation monitoring and wildlife protection through advanced threat detection systems.'}
                </p>
                
                {img.generated && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-success">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    AI Generated • Verified
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info banner */}
      <Card className="p-6 bg-primary/5 border-2 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Powered by AI & Satellite Technology
            </h4>
            <p className="text-sm text-muted-foreground">
              These images are generated using advanced AI to demonstrate the types of threats our system
              can detect. In production, the system processes real satellite imagery and field reports to
              identify and respond to actual environmental threats in real-time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
