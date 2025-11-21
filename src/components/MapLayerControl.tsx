import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Satellite, Map as MapIcon, TreeDeciduous } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface MapLayerControlProps {
  onLayerChange: (layer: string) => void;
  currentLayer: string;
}

export const MapLayerControl = ({ onLayerChange, currentLayer }: MapLayerControlProps) => {
  const layers = [
    { id: 'satellite-streets-v12', name: 'Satellite', icon: Satellite },
    { id: 'streets-v12', name: 'Streets', icon: MapIcon },
    { id: 'outdoors-v12', name: 'Terrain', icon: TreeDeciduous },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 shadow-lg bg-white border-2 border-border hover:bg-muted">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Layers</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border-2 border-border shadow-xl">
        <DropdownMenuLabel className="text-foreground">Map Layers</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <DropdownMenuItem
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`${currentLayer === layer.id ? 'bg-primary/10 text-primary' : ''} hover:bg-muted`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {layer.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
