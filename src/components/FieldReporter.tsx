import { useState, useRef } from 'react';
import { Camera, Upload, MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AIDetectionScanner } from './AIDetectionScanner';

const FieldReporter = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [threatType, setThreatType] = useState<string>('Deforestation');
  const [description, setDescription] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

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
      // Try to get location, but don't fail if unavailable
      let loc = location;
      if (!loc) {
        try {
          toast.info('Getting your location...');
          loc = await getLocation();
          setLocation(loc);
        } catch (geoError) {
          console.warn('Geolocation unavailable, using default location:', geoError);
          // Use default location (Nairobi, Kenya) if geolocation fails
          loc = { lat: -1.2921, lon: 36.8219 };
          toast.warning('Location unavailable. Using default location. You can update it later.');
        }
      }

      // Upload to Supabase Storage
      toast.info('Uploading photo...');

      // Sanitize filename: remove special characters, accents, and spaces
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const sanitizedName = file.name
        .normalize('NFD') // Normalize accents
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .substring(0, 100); // Limit length

      const fileName = `${Date.now()}-${sanitizedName}`;

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
    console.log('Camera button clicked');
    if (fileInputRef.current) {
      console.log('Triggering camera file input');
      fileInputRef.current.click();
    } else {
      console.error('File input ref not found');
      toast.error('Camera not available. Please try uploading instead.');
    }
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked');
    if (uploadInputRef.current) {
      console.log('Triggering upload file input');
      uploadInputRef.current.click();
    } else {
      console.error('Upload input ref not found');
      toast.error('Upload not available. Please try again.');
    }
  };

  return (
    <Card className="p-8 shadow-xl bg-white border-2 border-border">
      <div className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3 mb-3 text-foreground">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Camera className="w-7 h-7 text-primary" />
          </div>
          Field Reporter
        </h2>
        <p className="text-base text-muted-foreground">
          Take or upload a photo to detect deforestation and forest fires using ML
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Take photo with camera"
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload image from device"
      />

      {/* Upload Buttons - Clean Design */}
      {!preview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={handleCameraClick}
            disabled={uploading || analyzing}
            size="lg"
            className="h-28 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg"
          >
            {uploading || analyzing ? (
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
            ) : (
              <Camera className="w-6 h-6 mr-2" />
            )}
            Take Photo
          </Button>

          <Button
            onClick={handleUploadClick}
            disabled={uploading || analyzing}
            variant="outline"
            size="lg"
            className="h-28 text-lg font-semibold border-2 hover:bg-muted shadow-lg"
          >
            <Upload className="w-6 h-6 mr-2" />
            Upload Image
          </Button>
        </div>
      )}

      {/* AI Scanner with Preview */}
      {preview && (
        <div className="mb-6">
          <AIDetectionScanner
            isScanning={analyzing}
            threatDetected={result ? result.threatDetected : null}
            imageUrl={preview}
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

      {/* Processing Status - Light Design */}
      {(uploading || analyzing) && (
        <div className="flex items-center justify-center gap-4 p-6 bg-primary/5 border-2 border-primary/20 rounded-xl mb-6">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <div>
            <p className="font-semibold text-foreground">
              {uploading && 'Uploading photo...'}
              {analyzing && 'Analyzing with ML models...'}
            </p>
            <p className="text-sm text-muted-foreground">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Location - Clean Badge */}
      {location && (
        <div className="flex items-center gap-3 p-4 bg-accent/10 border-2 border-accent/20 rounded-xl mb-6">
          <MapPin className="w-6 h-6 text-accent" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Location captured</p>
            <p className="text-muted-foreground">
              {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Results - Simplified User-Friendly Message */}
      {result && (
        <div className="space-y-4">
          {result.threatDetected ? (
            <div className="p-6 bg-success/10 border-2 border-success/30 rounded-xl">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-success flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-success mb-3">🙏 Thank You!</h3>
                  <p className="text-base text-foreground mb-4">
                    Your report has been received. Our team will review it shortly and take appropriate action.
                  </p>
                  <div className="p-4 bg-white rounded-lg border border-border">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Report Details:</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Type:</span> <span className="font-semibold text-foreground">{result.incident?.threat_type}</span></p>
                      <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold text-orange-600">Pending Review</span></p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    💚 Thank you for helping protect Kenya's forests!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-muted/50 border-2 border-border rounded-xl">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-xl text-foreground mb-2">No Threats Detected</h3>
                  <p className="text-sm text-muted-foreground">
                    Our analysis found no environmental threats in this image. Thank you for staying vigilant!
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
            className="w-full h-12 text-base font-semibold"
          >
            Report Another Incident
          </Button>
        </div>
      )}

      {/* Instructions - Clean Info Box */}
      {!preview && !uploading && !analyzing && (
        <div className="p-5 bg-muted/50 border-2 border-border rounded-xl">
          <p className="text-sm font-semibold mb-3 text-foreground">How it works:</p>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
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
