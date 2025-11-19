import { useState, useRef } from 'react';
import { Camera, Upload, MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FieldReporter = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [threatType, setThreatType] = useState<string>('deforestation');
  const [description, setDescription] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLocation = () => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setResult(null);

    try {
      // Get location
      toast.info('Getting your location...');
      const loc = await getLocation();
      setLocation(loc);

      // Upload to Supabase Storage
      toast.info('Uploading photo...');
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('incident-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('incident-photos')
        .getPublicUrl(fileName);

      toast.success('Photo uploaded! Analyzing with ML...');
      setAnalyzing(true);

      // Analyze with ML
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-satellite',
        {
          body: {
            imageUrl: publicUrl,
            lat: loc.lat,
            lon: loc.lon,
            threatType,
            description,
          },
        }
      );

      if (analysisError) throw analysisError;

      setResult(analysisData);

      if (analysisData.threatDetected) {
        toast.success('Threat detected! Incident created and alerts sent.', {
          duration: 5000,
        });
      } else {
        toast.info('No threats detected in this image.', {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Camera className="w-6 h-6 text-primary" />
          Field Reporter
        </h2>
        <p className="text-sm text-muted-foreground">
          Take or upload a photo to detect deforestation and forest fires using ML
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Buttons */}
      {!preview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={handleCameraClick}
            disabled={uploading || analyzing}
            size="lg"
            className="h-24 text-lg"
          >
            {uploading || analyzing ? (
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
            ) : (
              <Camera className="w-6 h-6 mr-2" />
            )}
            Take Photo
          </Button>

          <Button
            onClick={handleCameraClick}
            disabled={uploading || analyzing}
            variant="outline"
            size="lg"
            className="h-24 text-lg"
          >
            <Upload className="w-6 h-6 mr-2" />
            Upload Image
          </Button>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mb-6">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-border"
          />
          {!analyzing && !result && (
            <Button
              onClick={() => {
                setPreview(null);
                setLocation(null);
              }}
              variant="outline"
              className="mt-4 w-full"
            >
              Choose Different Photo
            </Button>
          )}
        </div>
      )}

      {/* Processing Status */}
      {(uploading || analyzing) && (
        <div className="flex items-center justify-center gap-3 p-6 bg-muted rounded-lg mb-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <div>
            <p className="font-medium">
              {uploading && 'Uploading photo...'}
              {analyzing && 'Analyzing with ML models...'}
            </p>
            <p className="text-sm text-muted-foreground">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Location */}
      {location && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg mb-6">
          <MapPin className="w-5 h-5 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Location captured</p>
            <p className="text-muted-foreground">
              {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.threatDetected ? (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-destructive mb-2">Threat Detected!</h3>
                  <p className="text-sm mb-2">
                    Type: <span className="font-medium">{result.incident?.threat_type}</span>
                  </p>
                  <p className="text-sm mb-2">
                    Severity: <span className="font-medium capitalize">{result.incident?.severity}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.incident?.description}
                  </p>
                  <div className="mt-4 p-3 bg-background rounded">
                    <p className="text-xs font-medium mb-1">Actions Taken:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ Incident logged to database</li>
                      <li>✓ Alert sent via WhatsApp</li>
                      <li>✓ Location marked on map</li>
                      <li>✓ Photo saved for records</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-success/10 border border-success rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-success mb-2">No Threats Detected</h3>
                  <p className="text-sm text-muted-foreground">
                    The ML analysis found no signs of deforestation or forest fires in this image.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              setPreview(null);
              setResult(null);
              setLocation(null);
            }}
            className="w-full"
          >
            Report Another Incident
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!preview && !uploading && !analyzing && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">How it works:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Take a photo or upload an image</li>
            <li>We'll capture your GPS location automatically</li>
            <li>Our ML models analyze the image for threats</li>
            <li>If detected, an incident is created and alerts are sent</li>
          </ol>
        </div>
      )}
    </Card>
  );
};

export default FieldReporter;
