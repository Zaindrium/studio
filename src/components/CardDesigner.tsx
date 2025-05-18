
"use client";

import type { CardDesignSettings } from '@/lib/app-types'; // Updated import from lib/types to lib/app-types
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// Select and RadioGroup are no longer needed here
import { Input } from '@/components/ui/input';
import { Palette, /* LayoutGrid, */ Nfc, Settings2, QrCode } from 'lucide-react'; // LayoutGrid removed
import { useToast } from '@/hooks/use-toast';
import React, { memo } from 'react';

interface CardDesignerProps {
  design: CardDesignSettings;
  onDesignChange: (newDesign: Partial<CardDesignSettings>) => void; // Changed to Partial as template/layout are not set here
}

const CardDesignerComponent = ({ design, onDesignChange }: CardDesignerProps) => {
  const { toast } = useToast();

  // Template change handler is removed
  // Layout change handler is removed
  
  const handleColorChange = (colorField: keyof CardDesignSettings['colorScheme'], value: string) => {
    onDesignChange({
      // ...design, // Spread existing design to keep other properties like template and layout
      colorScheme: {
        ...design.colorScheme,
        [colorField]: value,
      },
    });
  };

  const handleNfcWrite = () => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      console.log('Attempting to write to NFC tag with data:', design.qrCodeUrl);
      toast({
        title: "NFC Ready!",
        description: "Enable NFC on your phone and tap it to your tag to write your card URL.",
        duration: 7000, 
      });
      // Actual WebNFC write logic would go here
    } else {
      toast({
        title: "WebNFC Not Supported",
        description: "Your browser doesn't support WebNFC. Try Chrome on Android for this feature.",
        variant: "destructive",
        duration: 7000,
      });
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Settings2 className="mr-2 h-6 w-6 text-primary" />Card Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection Removed */}
        {/* Layout Selection Removed */}

        <div className="space-y-4">
            <Label className="flex items-center mb-2"><Palette className="mr-2 h-4 w-4" />Card Color Scheme</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="card-bg-color" className="text-sm">Background</Label>
                    <Input
                        id="card-bg-color"
                        type="color"
                        value={design.colorScheme.cardBackground}
                        onChange={(e) => handleColorChange('cardBackground', e.target.value)}
                        className="w-full h-10 p-1 mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="card-text-color" className="text-sm">Text</Label>
                    <Input
                        id="card-text-color"
                        type="color"
                        value={design.colorScheme.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="w-full h-10 p-1 mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="card-primary-color" className="text-sm">Accent</Label>
                    <Input
                        id="card-primary-color"
                        type="color"
                        value={design.colorScheme.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-full h-10 p-1 mt-1"
                    />
                </div>
            </div>
        </div>

        <div>
          <Label htmlFor="qr-url" className="flex items-center mb-2"><QrCode className="mr-2 h-4 w-4" />QR Code URL</Label>
          <Input 
            id="qr-url" 
            value={design.qrCodeUrl} 
            onChange={(e) => onDesignChange({ qrCodeUrl: e.target.value })} // Only updates qrCodeUrl
            placeholder="e.g., https://your-domain.com/card-id"
          />
        </div>

        <div>
          <Button onClick={handleNfcWrite} className="w-full">
            <Nfc className="mr-2 h-5 w-5" /> Write to NFC Tag
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Tap to write your card URL to an NFC tag. Ensure NFC is enabled and tap your phone to the tag. Requires a browser with WebNFC support (e.g., Chrome on Android).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export const CardDesigner = memo(CardDesignerComponent);
