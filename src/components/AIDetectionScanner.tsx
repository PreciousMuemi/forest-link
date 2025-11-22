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
    <div className="relative rounded-2xl overflow-hidden glass-card border-2 border-primary/30 shadow-lg p-6 backdrop-blur-md">
      {imageUrl && (
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-md">
          <img src={imageUrl} alt="Scanning" className="w-full h-64 object-cover" />
          
          {/* Scanning overlay effect */}
          {isScanning && (
            <>
              {/* Scanning line */}
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{
                  top: `${scanProgress}%`,
                  transition: 'top 0.1s linear',
                  boxShadow: '0 0 20px hsl(152 69% 45% / 0.8)'
                }}
              />
              
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid-pattern opacity-20" />
              
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-10 h-10 border-t-3 border-l-3 border-primary animate-pulse" />
              <div className="absolute top-3 right-3 w-10 h-10 border-t-3 border-r-3 border-primary animate-pulse" />
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-3 border-l-3 border-primary animate-pulse" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-3 border-r-3 border-primary animate-pulse" />
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
                <Scan className="h-5 w-5 text-primary animate-pulse" />
                <span className="font-semibold text-foreground">
                  {scanPhase === 'analyzing' && 'Analyzing image...'}
                  {scanPhase === 'detecting' && 'Detecting threats...'}
                  {scanPhase === 'complete' && 'Finalizing...'}
                </span>
              </div>
              <span className="text-muted-foreground font-medium">{scanProgress}%</span>
            </div>
            
            <div className="relative h-3 bg-gradient-card rounded-full overflow-hidden border border-border/30 backdrop-blur-sm">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>

            {/* AI Processing indicators */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className={`flex items-center gap-2 p-3 rounded-lg backdrop-blur-sm ${scanProgress > 20 ? 'bg-gradient-card text-primary border border-primary/30' : 'bg-gradient-card text-muted-foreground border border-border'}`}>
                <div className={`w-2 h-2 rounded-full ${scanProgress > 20 ? 'bg-primary' : 'bg-muted-foreground'} animate-pulse`} />
                Vision AI
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg backdrop-blur-sm ${scanProgress > 50 ? 'bg-gradient-card text-primary border border-primary/30' : 'bg-gradient-card text-muted-foreground border border-border'}`}>
                <div className={`w-2 h-2 rounded-full ${scanProgress > 50 ? 'bg-primary' : 'bg-muted-foreground'} animate-pulse`} />
                ML Model
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg backdrop-blur-sm ${scanProgress > 80 ? 'bg-gradient-card text-primary border border-primary/30' : 'bg-gradient-card text-muted-foreground border border-border'}`}>
                <div className={`w-2 h-2 rounded-full ${scanProgress > 80 ? 'bg-primary' : 'bg-muted-foreground'} animate-pulse`} />
                Classification
              </div>
            </div>
          </>
        )}

        {/* Result */}
        {!isScanning && threatDetected !== null && (
          <div className={`flex items-center gap-4 p-5 rounded-xl border-2 backdrop-blur-sm ${
            threatDetected 
              ? 'bg-gradient-card border-destructive/40' 
              : 'bg-gradient-card border-success/40'
          }`}>
            {threatDetected ? (
              <>
                <AlertTriangle className="h-8 w-8 text-destructive animate-pulse flex-shrink-0" />
                <div>
                  <p className="font-bold text-lg text-destructive">Threat Detected!</p>
                  <p className="text-sm text-muted-foreground">Environmental threat identified by AI</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-8 w-8 text-success flex-shrink-0" />
                <div>
                  <p className="font-bold text-lg text-success">No Threats Detected</p>
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
            linear-gradient(rgba(31, 200, 113, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31, 200, 113, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};
