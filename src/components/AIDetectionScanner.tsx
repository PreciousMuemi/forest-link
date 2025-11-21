import { useEffect, useState } from 'react';
import { Scan, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AIDetectionScannerProps {
  isScanning: boolean;
  threatDetected: boolean | null;
  imageUrl?: string;
}

export const AIDetectionScanner = ({ isScanning, threatDetected, imageUrl }: AIDetectionScannerProps) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<'analyzing' | 'detecting' | 'complete'>('analyzing');

  useEffect(() => {
    if (isScanning) {
      setScanProgress(0);
      setScanPhase('analyzing');
      
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev < 40) {
            setScanPhase('analyzing');
            return prev + 2;
          } else if (prev < 80) {
            setScanPhase('detecting');
            return prev + 3;
          } else if (prev < 100) {
            setScanPhase('complete');
            return prev + 5;
          }
          return 100;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  if (!isScanning && threatDetected === null) return null;

  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 p-6">
      {imageUrl && (
        <div className="relative mb-4 rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Scanning" className="w-full h-48 object-cover" />
          
          {/* Scanning overlay effect */}
          {isScanning && (
            <>
              {/* Scanning line */}
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{
                  top: `${scanProgress}%`,
                  transition: 'top 0.1s linear',
                  boxShadow: '0 0 20px rgba(var(--primary), 0.8)'
                }}
              />
              
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
              
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary animate-pulse" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-primary animate-pulse" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-primary animate-pulse" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary animate-pulse" />
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Scan progress */}
        {isScanning && (
          <>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-medium">
                  {scanPhase === 'analyzing' && 'Analyzing image...'}
                  {scanPhase === 'detecting' && 'Detecting threats...'}
                  {scanPhase === 'complete' && 'Finalizing...'}
                </span>
              </div>
              <span className="text-muted-foreground">{scanProgress}%</span>
            </div>
            
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            {/* AI Processing indicators */}
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className={`flex items-center gap-1 ${scanProgress > 20 ? 'text-primary' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${scanProgress > 20 ? 'bg-primary' : 'bg-muted'} animate-pulse`} />
                Vision AI
              </div>
              <div className={`flex items-center gap-1 ${scanProgress > 50 ? 'text-primary' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${scanProgress > 50 ? 'bg-primary' : 'bg-muted'} animate-pulse`} />
                ML Model
              </div>
              <div className={`flex items-center gap-1 ${scanProgress > 80 ? 'text-primary' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${scanProgress > 80 ? 'bg-primary' : 'bg-muted'} animate-pulse`} />
                Classification
              </div>
            </div>
          </>
        )}

        {/* Result */}
        {!isScanning && threatDetected !== null && (
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            threatDetected 
              ? 'bg-destructive/10 border-destructive/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            {threatDetected ? (
              <>
                <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
                <div>
                  <p className="font-semibold text-destructive">Threat Detected!</p>
                  <p className="text-sm text-muted-foreground">Environmental threat identified by AI</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-500">No Threats Detected</p>
                  <p className="text-sm text-muted-foreground">Forest area appears healthy</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary) / 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};
