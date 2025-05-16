
"use client";

import React, { useState, useEffect } from 'react';
import type { UserProfile, CardDesignSettings } from '@/lib/types';
import { suggestDesign, SuggestDesignInput, SuggestDesignOutput } from '@/ai/flows/suggest-design';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Wand2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AiDesignAssistantProps {
  userProfile: UserProfile;
  currentDesign: CardDesignSettings;
  onApplySuggestions: (updatedDesign: Partial<CardDesignSettings>) => void;
  onUpdateProfileForAI: (aiRelatedProfileData: {userInfo?: string, targetAudience?: string}) => void;
}

export function AiDesignAssistant({ userProfile, currentDesign, onApplySuggestions, onUpdateProfileForAI }: AiDesignAssistantProps) {
  const [suggestions, setSuggestions] = useState<SuggestDesignOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestDesign = async () => {
    if (!userProfile.userInfo?.trim() || !userProfile.targetAudience?.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide 'Your Info' and 'Target Audience' in your profile for the AI.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);
    try {
      const input: SuggestDesignInput = { 
        userInfo: userProfile.userInfo, 
        targetAudience: userProfile.targetAudience 
      };
      const result = await suggestDesign(input);
      setSuggestions(result);
      toast({
        title: "AI Suggestions Ready!",
        description: "Check out the design ideas below.",
      });
    } catch (error) {
      console.error("AI suggestion error:", error);
      let message = "Could not fetch design suggestions. Please try again.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "AI Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseColorSuggestion = (colorString: string): Partial<CardDesignSettings['colorScheme']> => {
    const colorScheme: Partial<CardDesignSettings['colorScheme']> = {};
    const colorRegex = /(Background|Text|Accent):\s*[^#]*(#[\w\d]{6}|#[\w\d]{3})/gi;
    let match;
    while ((match = colorRegex.exec(colorString)) !== null) {
        const type = match[1].toLowerCase();
        const colorValue = match[2];
        if (type === "background") colorScheme.cardBackground = colorValue;
        else if (type === "text") colorScheme.textColor = colorValue;
        else if (type === "accent") colorScheme.primaryColor = colorValue;
    }
    return colorScheme;
  };

  const handleApplySuggestions = () => {
    if (!suggestions) return;
    
    const updatedColorScheme = parseColorSuggestion(suggestions.colorCombinationSuggestion);
    
    let updatedLayout: CardDesignSettings['layout'] = currentDesign.layout;
    const layoutSuggestionLower = suggestions.layoutSuggestion.toLowerCase();
    if (layoutSuggestionLower.includes("left") || layoutSuggestionLower.includes("image on the left")) updatedLayout = 'image-left';
    else if (layoutSuggestionLower.includes("right") || layoutSuggestionLower.includes("image on the right")) updatedLayout = 'image-right';
    else if (layoutSuggestionLower.includes("top") || layoutSuggestionLower.includes("image at the top")) updatedLayout = 'image-top';

    onApplySuggestions({
        layout: updatedLayout,
        colorScheme: {
            ...currentDesign.colorScheme,
            ...updatedColorScheme 
        }
    });

    toast({
      title: "Suggestions Applied!",
      description: "The card design has been updated with AI recommendations.",
    });
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Sparkles className="mr-2 h-6 w-6 text-primary" />AI Design Assistant</CardTitle>
        <CardDescription>
          Get AI-powered suggestions for your card layout and colors. Uses "Your Info" and "Target Audience" from your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            The AI uses the "Your Info (Profession, Interests)" and "Target Audience" fields from your main profile (editable in the "Your Profile" section above). Make sure they are filled out for the best suggestions!
          </AlertDescription>
        </Alert>
        
        <div className="p-4 border rounded-md bg-secondary/20">
            <p className="text-sm font-medium">Current AI Inputs:</p>
            <p className="text-xs text-muted-foreground mt-1"><strong>Your Info:</strong> {userProfile.userInfo || "Not set in profile"}</p>
            <p className="text-xs text-muted-foreground mt-1"><strong>Target Audience:</strong> {userProfile.targetAudience || "Not set in profile"}</p>
        </div>

        <Button onClick={handleSuggestDesign} disabled={isLoading || !userProfile.userInfo?.trim() || !userProfile.targetAudience?.trim()} className="w-full">
          <Wand2 className="mr-2 h-5 w-5" />
          {isLoading ? 'Getting Suggestions...' : 'Suggest Designs'}
        </Button>

        {suggestions && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/30 space-y-4">
            <h3 className="text-lg font-semibold">AI Suggestions:</h3>
            <div>
              <Label className="font-medium">Layout Suggestion:</Label>
              <p className="text-sm p-2 bg-background rounded-md">{suggestions.layoutSuggestion}</p>
            </div>
            <div>
              <Label className="font-medium">Color Combination Suggestion:</Label>
              <p className="text-sm p-2 bg-background rounded-md">{suggestions.colorCombinationSuggestion}</p>
            </div>
            <Button onClick={handleApplySuggestions} variant="outline" className="w-full mt-2">Apply Suggestions</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
