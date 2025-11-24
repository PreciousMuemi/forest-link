import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

const TestIncidentButton = () => {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/ranger')} className="gap-2 shadow-lg">
      <Compass className="h-4 w-4" />
      Go to Rangers Dashboard
    </Button>
  );
};

export default TestIncidentButton;
