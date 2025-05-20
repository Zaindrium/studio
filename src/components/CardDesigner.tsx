
"use client";

import type { CardDesignSettings } from '@/lib/app-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Palette, Nfc, Settings2, QrCode, CheckCircle, Pencil, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { memo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image'; // Import next/image

interface CardDesignerProps {
  design: CardDesignSettings;
  onDesignChange: (newDesign: Partial<CardDesignSettings>) => void;
}

const fonts = [
  { name: "Merriweather", className: "font-merriweather" },
  { name: "Libre Baskerville", className: "font-libre-baskerville" },
  { name: "Lato", className: "font-lato" },
  { name: "Nunito Sans", className: "font-nunito-sans" },
  { name: "Montserrat", className: "font-montserrat" },
];

const colors = [
  { name: "Rainbow", value: "rainbow" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Light Blue", value: "#60A5FA" },
  { name: "Teal", value: "#14B8A6" },
];

const cardDesigns = [
  { name: "Classic", pro: false, style: {backgroundColor: '#FF5733', waveColor: '#C70039'} }, // Example style
  { name: "Flat", pro: true, style: {backgroundColor: '#FFC300'} },
  { name: "Modern", pro: true, style: {backgroundColor: '#DAF7A6', accentColor: '#FFC300'} },
  { name: "Sleek", pro: true, style: {backgroundColor: '#581845'} },
  { name: "Blend", pro: true, style: {backgroundGradient: 'linear-gradient(to right, #FF5733, #FFC300)'} },
];

const CardDesignerComponent = ({ design, onDesignChange }: CardDesignerProps) => {
  const { toast } = useToast();
  const [selectedFont, setSelectedFont] = useState(fonts[0].name);
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [selectedDesign, setSelectedDesign] = useState(cardDesigns[0].name);
  const [profilePhoto, setProfilePhoto] = useState<string | null>("/placeholder-profile.jpg"); // Placeholder image

  const handleColorChange = (colorField: keyof CardDesignSettings['colorScheme'], value: string) => {
    onDesignChange({
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

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePhoto(URL.createObjectURL(file));
      // Here you would typically upload the file to a server
      // and then update the design with the new photo URL
      // onDesignChange({ profilePhotoUrl: 'new_url_from_server' });
      toast({ title: "Photo Updated", description: "Profile photo changed." });
    }
  };

  return (
    <Card className="shadow-lg bg-gray-900 text-white border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                 <Settings2 className="h-6 w-6" /> {/* Placeholder for back arrow for now */}
            </Button>
            <CardTitle className="flex items-center text-xl">Edit Card</CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">Save</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg">
          <Palette className="mr-2 h-5 w-5 transform rotate-180" /> Preview
        </Button>
        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-md">
            <TabsTrigger value="display" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300">Display</TabsTrigger>
            <TabsTrigger value="information" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300">Information</TabsTrigger>
            <TabsTrigger value="fields" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300">Fields</TabsTrigger>
          </TabsList>
          <TabsContent value="display" className="mt-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Design</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {cardDesigns.map((d) => (
                  <Button
                    key={d.name}
                    variant="outline"
                    className={`h-auto text-center p-0 border-2 relative overflow-hidden ${selectedDesign === d.name ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'}`}
                    onClick={() => setSelectedDesign(d.name)}
                  >
                    <div className="w-full h-16 rounded-md flex flex-col items-center justify-center" 
                         style={d.style.backgroundGradient ? {backgroundImage: d.style.backgroundGradient} : {backgroundColor: d.style.backgroundColor}}>
                      {/* Example visual representation - refine as needed */}
                      {d.name === "Classic" && <div className="w-full h-1/2 bg-black opacity-20 rounded-t-md"></div>}
                      {d.name === "Modern" && <div className="w-1/2 h-1/2 bg-gray-700 opacity-50 absolute bottom-0 right-0 rounded-tr-md rounded-bl-md"></div>}
                    </div>
                    <span className={`block text-xs mt-1 py-1 ${selectedDesign === d.name ? 'text-red-500' : 'text-gray-300'}`}>{d.name}</span>
                    {d.pro && (
                      <span className="absolute top-1 right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-sm">PRO</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold">Profile Photo</Label>
                    <Button variant="outline" size="sm" className="text-xs text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                        onClick={() => document.getElementById('profile-photo-upload')?.click()}>
                        <Pencil className="mr-2 h-3 w-3" /> Change Photo or Video
                    </Button>
                    <input type="file" id="profile-photo-upload" accept="image/*,video/*" className="hidden" onChange={handleProfilePhotoChange} />
                </div>
                {profilePhoto ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden group">
                        <Image src={profilePhoto} alt="Profile" layout="fill" objectFit="cover" />
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 text-white bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setProfilePhoto(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No photo</span>
                    </div>
                )}
            </div>

            <div className="space-y-4 mt-6">
              <Label className="text-lg font-semibold">Color</Label>
              <div className="flex space-x-3 items-center overflow-x-auto pb-2">
                {colors.map((color) => (
                  <Button
                    key={color.name}
                    variant="outline"
                    size="icon"
                    className={`w-10 h-10 rounded-full flex-shrink-0 relative ${selectedColor === color.value ? 'border-2 border-red-500' : 'border-gray-600'}`}
                    onClick={() => setSelectedColor(color.value)}
                    style={color.value !== "rainbow" ? {backgroundColor: color.value} : {}}
                  >
                    {color.value === "rainbow" ? (
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500" />
                    ) : null}
                    {selectedColor === color.value && <CheckCircle className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" style={{mixBlendMode: 'difference'}}/>}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <Label className="text-lg font-semibold">Font</Label>
              <div className="grid grid-cols-2 gap-4">
                {fonts.map((font) => (
                  <Button
                    key={font.name}
                    variant={selectedFont === font.name ? "default" : "outline"}
                    className={`h-auto text-left p-0 rounded-lg ${selectedFont === font.name ? 'bg-red-600 border-red-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                    onClick={() => setSelectedFont(font.name)}
                  >
                    <div className={`p-4 rounded-lg border ${selectedFont === font.name ? 'border-red-500' : 'border-gray-700'} w-full`}>
                      <div className={`text-xl font-bold ${font.className} ${selectedFont === font.name ? 'text-white' : 'text-gray-200'}`}>Alice Hello</div>
                      <div className={`text-sm ${font.className} ${selectedFont === font.name ? 'text-red-200' : 'text-gray-400'}`}>Program Director</div>
                      <div className={`text-xs ${font.className} ${selectedFont === font.name ? 'text-red-200' : 'text-gray-400'}`}>Hansen Construction</div>
                      <div className={`text-xs ${font.className} ${selectedFont === font.name ? 'text-red-200' : 'text-gray-400'}`}>(123) 456-7890</div>
                      <div className={`mt-2 text-xs ${font.className} ${selectedFont === font.name ? 'text-white bg-red-500' : 'text-gray-300 bg-gray-700'} px-2 py-1 rounded inline-block`}>{font.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="information" className="mt-6">
            <p className="text-gray-400">Information settings will go here.</p>
          </TabsContent>
          <TabsContent value="fields" className="mt-6">
            <p className="text-gray-400">Fields settings will go here.</p>
          </TabsContent>
        </Tabs>

        {/* Keeping original color scheme, QR, and NFC sections for now, can be removed or integrated into tabs if needed */}
        <div className="space-y-4 pt-6 border-t border-gray-700">
            <Label className="flex items-center mb-2 text-lg font-semibold"><Palette className="mr-2 h-5 w-5" />Original Card Color Scheme</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="card-bg-color" className="text-sm text-gray-400">Background</Label>
                    <Input
                        id="card-bg-color"
                        type="color"
                        value={design.colorScheme.cardBackground}
                        onChange={(e) => handleColorChange('cardBackground', e.target.value)}
                        className="w-full h-10 p-1 mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                </div>
                <div>
                    <Label htmlFor="card-text-color" className="text-sm text-gray-400">Text</Label>
                    <Input
                        id="card-text-color"
                        type="color"
                        value={design.colorScheme.textColor}
                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                        className="w-full h-10 p-1 mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                </div>
                <div>
                    <Label htmlFor="card-primary-color" className="text-sm text-gray-400">Accent</Label>
                    <Input
                        id="card-primary-color"
                        type="color"
                        value={design.colorScheme.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-full h-10 p-1 mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-gray-700">
          <Label htmlFor="qr-url" className="flex items-center mb-2 text-lg font-semibold"><QrCode className="mr-2 h-5 w-5" />QR Code URL</Label>
          <Input 
            id="qr-url" 
            value={design.qrCodeUrl} 
            onChange={(e) => onDesignChange({ qrCodeUrl: e.target.value })}
            placeholder="e.g., https://your-domain.com/card-id"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-500"
          />
        </div>

        <div className="pt-6 border-t border-gray-700">
          <Button onClick={handleNfcWrite} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
            <Nfc className="mr-2 h-5 w-5" /> Write to NFC Tag
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Tap to write your card URL to an NFC tag. Ensure NFC is enabled and tap your phone to the tag. Requires a browser with WebNFC support (e.g., Chrome on Android).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export const CardDesigner = memo(CardDesignerComponent);
