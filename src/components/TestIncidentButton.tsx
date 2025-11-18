import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Zap } from 'lucide-react';

const TestIncidentButton = () => {
  const [loading, setLoading] = useState(false);

  const createTestIncident = async () => {
    setLoading(true);
    try {
      // Random location in Kenya (forest areas)
      const lat = -0.5 + Math.random() * 2;
      const lon = 36 + Math.random() * 2;
      
      const threats = ['fire', 'deforestation', 'illegal_logging'];
      const severities = ['low', 'medium', 'high', 'critical'];
      
      const threat = threats[Math.floor(Math.random() * threats.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      const { data, error } = await supabase.functions.invoke('process-detection', {
        body: {
          lat,
          lon,
          threat_type: threat,
          severity,
          description: `Simulated ${threat} detection at coordinates ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        },
      });

      if (error) throw error;

      toast.success('Test incident created!', {
        description: `${threat} detected with ${severity} severity`,
      });
    } catch (error) {
      console.error('Error creating test incident:', error);
      toast.error('Failed to create test incident', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={createTestIncident}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Zap className="h-4 w-4" />
          Simulate ML Detection
        </>
      )}
    </Button>
  );
};

export default TestIncidentButton;
