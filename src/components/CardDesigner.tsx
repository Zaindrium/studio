"use client";

import type { CardDesignSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from '@/components/ui/input';
import { Palette, LayoutGrid, Nfc, Settings2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CardDesignerProps {
  design: CardDesignSettings;
  onDesignChange: (newDesign: CardDesignSettings) => void;
}

export function CardDesigner({ design, onDesignChange }: CardDesignerProps) {
  const { toast } = useToast();

  const handleTemplateChange = (value: string) => {
    onDesignChange({ ...design, template: value as CardDesignSettings['template'] });
  };

  const handleLayoutChange = (value: string) => {
    onDesignChange({ ...design, layout: value as CardDesignSettings['layout'] });
  };
  
  const handleColorChange = (colorField: keyof CardDesignSettings['colorScheme'], value: string) => {
    onDesignChange({
      ...design,
      colorScheme: {
        ...design.colorScheme,
        [colorField]: value,
      },
    });
  };

  const handleNfcWrite = () => {
    console.log('Attempting to write to NFC tag with data:', design.qrCodeUrl);
    toast({
      title: "NFC Write Feature",
      description: "This would initiate writing to an NFC tag using WebNFC API if available. (This is a UI placeholder)",
      duration: 5000,
    });
    // Example WebNFC logic (requires HTTPS and user interaction):
    // if ('NDEFReader' in window) {
    //   const ndef = new window.NDEFReader();
    //   ndef.write({
    //     records: [{ recordType: "url", data: design.qrCodeUrl }]
    //   }).then(() => {
    //     toast({ title: "Success", description: "Data written to NFC tag." });
    //   }).catch((error: Error) => {
    //     console.error("NFC write error:", error);
    //     toast({ title: "Error", description: `NFC Error: ${error.message}`, variant: "destructive" });
    //   });
    // } else {
    //   toast({ title: "Unsupported", description: "Web NFC is not supported on this browser or context.", variant: "destructive" });
    // }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Settings2 className="mr-2 h-6 w-6 text-primary" />Card Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="template-select" className="flex items-center mb-2"><Palette className="mr-2 h-4 w-4" />Template</Label>
          <Select value={design.template} onValueChange={handleTemplateChange}>
            <SelectTrigger id="template-select" className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="flex items-center mb-2"><LayoutGrid className="mr-2 h-4 w-4" />Layout (Profile Image Position)</Label>
          <RadioGroup
            value={design.layout}
            onValueChange={handleLayoutChange}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image-left" id="layout-left" />
              <Label htmlFor="layout-left">Image Left</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image-right" id="layout-right" />
              <Label htmlFor="layout-right">Image Right</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image-top" id="layout-top" />
              <Label htmlFor="layout-top">Image Top</Label>
            </div>
          </RadioGroup>
        </div>

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
            onChange={(e) => onDesignChange({...design, qrCodeUrl: e.target.value})}
            placeholder="e.g., https://your-domain.com/card-id"
          />
        </div>

        <div>
          <Button onClick={handleNfcWrite} className="w-full bg-accent hover:bg-accent/90">
            <Nfc className="mr-2 h-5 w-5" /> Write to NFC Tag
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Securely write your card to an NFC tag. (WebNFC browser support required)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
