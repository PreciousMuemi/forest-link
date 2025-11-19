import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const OfflineIndicator = () => {
  const { isOnline, queue, hasQueuedItems } = useOfflineQueue();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? 'Online' : 'Offline'}
      </Badge>

      {hasQueuedItems && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              {queue.length} queued
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Offline Queue</h4>
              <p className="text-sm text-muted-foreground">
                {queue.length} photo{queue.length !== 1 ? 's' : ''} waiting to upload
              </p>
              {!isOnline && (
                <p className="text-xs text-muted-foreground">
                  Photos will upload automatically when connection is restored
                </p>
              )}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {queue.map((item) => (
                  <div key={item.id} className="text-xs p-2 bg-muted rounded">
                    {item.file.name} - {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
