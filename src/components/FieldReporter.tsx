import { useState, useRef } from 'react';
import { Camera, Upload, MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AIDetectionScanner } from './AIDetectionScanner';

const FieldReporter = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [threatType, setThreatType] = useState<string>('fire');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<number[]>([5]);
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
    <Card className="p-8 shadow-xl glass-card border-2 border-primary/20">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold flex items-center gap-3 mb-4 text-foreground tracking-tight">
          <div className="bg-gradient-primary p-4 rounded-2xl shadow-soft glow-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          Field Reporter
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
          Take or upload a photo to detect deforestation and forest fires using ML
        </p>
      </div>

      {/* Report Details Form */}
      <div className="space-y-6 mb-8 p-6 bg-gradient-card border-2 border-border rounded-xl">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base font-semibold">Threat Category</Label>
          <Select value={threatType} onValueChange={setThreatType}>
            <SelectTrigger id="category" className="h-12 text-base">
              <SelectValue placeholder="Select threat type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fire">🔥 Fire</SelectItem>
              <SelectItem value="logging">🪓 Illegal Logging</SelectItem>
              <SelectItem value="charcoal">⚫ Charcoal Production</SelectItem>
              <SelectItem value="wildlife">🦁 Wildlife Issue</SelectItem>
              <SelectItem value="other">❓ Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">What did you see? (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe what you observed... any additional details help our rangers respond faster"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] text-base resize-none"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="severity" className="text-base font-semibold">Severity Level</Label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-medium min-w-[60px]">Low</span>
            <Slider
              id="severity"
              value={severity}
              onValueChange={setSeverity}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground font-medium min-w-[60px] text-right">Critical</span>
          </div>
          <p className="text-sm text-muted-foreground">Current level: <span className="font-bold text-foreground">{severity[0]}/10</span></p>
        </div>
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

      {/* Upload Buttons */}
      {!preview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={handleCameraClick}
            disabled={uploading || analyzing}
            size="lg"
            className="h-32 text-xl font-bold bg-gradient-primary hover:opacity-90 shadow-government hover:shadow-glow transition-all duration-300 hover-lift"
          >
            {uploading || analyzing ? (
              <Loader2 className="w-7 h-7 animate-spin mr-3" />
            ) : (
              <Camera className="w-7 h-7 mr-3" />
            )}
            Take Photo
          </Button>

          <Button
            onClick={handleUploadClick}
            disabled={uploading || analyzing}
            variant="outline"
            size="lg"
            className="h-32 text-xl font-bold border-3 border-primary text-foreground hover:bg-gradient-card shadow-government hover:shadow-glow transition-all duration-300 hover-lift"
          >
            <Upload className="w-7 h-7 mr-3" />
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

      {/* Processing Status */}
      {(uploading || analyzing) && (
        <div className="flex items-center justify-center gap-5 p-8 bg-gradient-card border-2 border-primary/30 rounded-xl mb-6 backdrop-blur-sm">
          <Loader2 className="w-9 h-9 animate-spin text-primary" />
          <div>
            <p className="font-bold text-lg text-foreground">
              {uploading && 'Uploading photo...'}
              {analyzing && 'Analyzing with ML models...'}
            </p>
            <p className="text-base text-muted-foreground font-medium">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Location Badge */}
      {location && (
        <div className="flex items-center gap-4 p-5 bg-gradient-card border-2 border-accent/30 rounded-xl mb-6 backdrop-blur-sm">
          <MapPin className="w-7 h-7 text-accent" />
          <div className="text-base">
            <p className="font-bold text-foreground">Location captured</p>
            <p className="text-muted-foreground font-medium">
              {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.threatDetected ? (
            <div className="p-8 bg-gradient-card border-2 border-success/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-5">
                <CheckCircle className="w-10 h-10 text-success flex-shrink-0 mt-1 animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-extrabold text-3xl text-success mb-4 tracking-tight">🙏 Thank You!</h3>
                  <p className="text-lg text-foreground mb-6 leading-relaxed font-medium">
                    Your report has been received. Our team will review it shortly and take appropriate action.
                  </p>
                  <div className="p-5 bg-gradient-glass rounded-xl border border-border/50 backdrop-blur-md">
                    <p className="text-base font-bold text-muted-foreground mb-3">Report Details:</p>
                    <div className="space-y-2 text-base">
                      <p><span className="text-muted-foreground font-medium">Type:</span> <span className="font-bold text-foreground">{result.incident?.threat_type}</span></p>
                      <p><span className="text-muted-foreground font-medium">Status:</span> <span className="font-bold text-accent">Pending Review</span></p>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground mt-5 font-medium">
                    💚 Thank you for helping protect Kenya&apos;s forests!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gradient-card border-2 border-border rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-5">
                <CheckCircle className="w-10 h-10 text-muted-foreground flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-extrabold text-2xl text-foreground mb-3 tracking-tight">No Threats Detected</h3>
                  <p className="text-base text-muted-foreground leading-relaxed font-medium">
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
              setDescription('');
              setSeverity([5]);
            }}
            className="w-full h-14 text-lg font-bold hover-lift"
          >
            Report Another Incident
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!preview && !uploading && !analyzing && (
        <div className="p-6 bg-gradient-card border-2 border-border rounded-xl backdrop-blur-sm">
          <p className="text-base font-bold mb-4 text-foreground">How it works:</p>
          <ol className="text-base text-muted-foreground space-y-3 list-decimal list-inside leading-relaxed">
            <li className="font-medium">Take a photo or upload an image</li>
            <li className="font-medium">We&apos;ll capture your GPS location automatically</li>
            <li className="font-medium">Our ML models analyze the image for threats</li>
            <li className="font-medium">If detected, an incident is created and alerts are sent</li>
          </ol>
        </div>
      )}
    </Card>
  );
};

export default FieldReporter;
