import { useState, useEffect } from 'react';

interface QueuedPhoto {
  id: string;
  file: File;
  location: { lat: number; lon: number } | null;
  timestamp: string;
}

const QUEUE_KEY = 'forest_guard_offline_queue';

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedPhoto[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load queue from localStorage
    const loadQueue = () => {
      try {
        const stored = localStorage.getItem(QUEUE_KEY);
        if (stored) {
          setQueue(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    };

    loadQueue();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (file: File, location: { lat: number; lon: number } | null) => {
    const queuedItem: QueuedPhoto = {
      id: crypto.randomUUID(),
      file,
      location,
      timestamp: new Date().toISOString(),
    };

    const newQueue = [...queue, queuedItem];
    setQueue(newQueue);
    
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error('Error saving to offline queue:', error);
    }

    return queuedItem.id;
  };

  const removeFromQueue = (id: string) => {
    const newQueue = queue.filter(item => item.id !== id);
    setQueue(newQueue);
    
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error('Error updating offline queue:', error);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  };

  return {
    queue,
    isOnline,
    addToQueue,
    removeFromQueue,
    clearQueue,
    hasQueuedItems: queue.length > 0,
  };
};
