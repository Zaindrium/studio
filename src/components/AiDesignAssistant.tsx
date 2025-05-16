
"use client";

import React, { useState } from 'react';
import type { UserProfile, CardDesignSettings } from '@/lib/types';
import { proposeCardEnhancements, ProposeCardEnhancementsInput, ProposeCardEnhancementsOutput } from '@/ai/flows/propose-card-enhancements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Wand2, Lightbulb, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AiDesignAssistantProps {
  userProfile: UserProfile;
  currentDesign: CardDesignSettings;
  onApplySuggestions: (updatedDesign: Partial<CardDesignSettings>) => void;
  onUpdateProfileForAI: (aiRelatedProfileData: Partial<Pick<UserProfile, 'userInfo'>>) => void;
}

export function AiDesignAssistant({ userProfile, currentDesign, onApplySuggestions, onUpdateProfileForAI }: AiDesignAssistantProps) {
  const [suggestions, setSuggestions] = useState<ProposeCardEnhancementsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestEnhancements = async () => {
    if (!userProfile.name?.trim() && !userProfile.title?.trim() && !userProfile.email?.trim()) {
      toast({
        title: "More Info Needed",
        description: "Please fill in at least your Name, Title, or Email in your profile for the AI to generate meaningful suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);
    try {
      // Map UserProfile to ProposeCardEnhancementsInput
      const input: ProposeCardEnhancementsInput = {
        name: userProfile.name,
        title: userProfile.title,
        company: userProfile.company,
        phone: userProfile.phone,
        email: userProfile.email,
        website: userProfile.website,
        linkedin: userProfile.linkedin,
        twitter: userProfile.twitter,
        github: userProfile.github,
        address: userProfile.address,
        profilePictureUrl: userProfile.profilePictureUrl,
        cardBackgroundUrl: userProfile.cardBackgroundUrl,
        userInfo: userProfile.userInfo,
        targetAudience: userProfile.targetAudience,
      };
      const result = await proposeCardEnhancements(input);
      setSuggestions(result);
      toast({
        title: "AI Enhancements Ready!",
        description: "Check out the ideas below to improve your card.",
      });
    } catch (error) {
      console.error("AI enhancement error:", error);
      let message = "Could not fetch AI suggestions. Please try again.";
      if (error instanceof Error) {
        // Check if the error is from Zod parsing (e.g. unexpected format from LLM)
        if (error.name === 'ZodError') {
            message = "AI response was not in the expected format. Please try again.";
        } else {
            message = error.message;
        }
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

  const handleApplyEnhancements = () => {
    if (!suggestions) return;

    // Apply About Me suggestion
    if (suggestions.suggestedAboutMe) {
      onUpdateProfileForAI({ userInfo: suggestions.suggestedAboutMe });
    }

    // Apply layout and color scheme
    const designUpdate: Partial<CardDesignSettings> = {};
    if (suggestions.suggestedLayout) {
      designUpdate.layout = suggestions.suggestedLayout;
    }
    if (suggestions.suggestedColorScheme) {
      designUpdate.colorScheme = {
        cardBackground: suggestions.suggestedColorScheme.cardBackground || currentDesign.colorScheme.cardBackground,
        textColor: suggestions.suggestedColorScheme.textColor || currentDesign.colorScheme.textColor,
        primaryColor: suggestions.suggestedColorScheme.primaryColor || currentDesign.colorScheme.primaryColor,
      };
    }
    
    if (Object.keys(designUpdate).length > 0) {
        onApplySuggestions(designUpdate);
    }

    toast({
      title: "Enhancements Applied!",
      description: "The card design and profile have been updated with AI recommendations.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Sparkles className="mr-2 h-6 w-6 text-primary" />AI Card Enhancer</CardTitle>
        <CardDescription>
          Get AI-powered suggestions for your card's content, layout, and colors based on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            The AI uses your entire profile to generate holistic suggestions. Ensure your profile details are up-to-date for the best results!
          </AlertDescription>
        </Alert>

        <Button onClick={handleSuggestEnhancements} disabled={isLoading} className="w-full">
          <Wand2 className="mr-2 h-5 w-5" />
          {isLoading ? 'Getting Suggestions...' : 'Suggest Enhancements'}
        </Button>

        {suggestions && (
          <div className="mt-6 p-4 border rounded-md bg-secondary/30 space-y-6">
            <h3 className="text-lg font-semibold text-center">AI Suggestions:</h3>
            
            {suggestions.suggestedAboutMe && (
              <div>
                <Label className="font-medium text-base">Suggested "About Me":</Label>
                <p className="text-sm p-3 bg-background rounded-md whitespace-pre-wrap">{suggestions.suggestedAboutMe}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.suggestedLayout && (
                <div>
                  <Label className="font-medium">Layout:</Label>
                  <p className="text-sm p-2 bg-background rounded-md">{suggestions.suggestedLayout.replace('-', ' ')}</p>
                </div>
              )}

              {suggestions.suggestedColorScheme && (
                <div>
                  <Label className="font-medium">Color Scheme:</Label>
                  <div className="p-2 bg-background rounded-md space-y-1 text-sm">
                    <p>BG: <span className="font-mono px-1 py-0.5 rounded" style={{backgroundColor: suggestions.suggestedColorScheme.cardBackground, color: suggestions.suggestedColorScheme.textColor}}>{suggestions.suggestedColorScheme.cardBackground}</span></p>
                    <p>Text: <span className="font-mono px-1 py-0.5 rounded" style={{backgroundColor: suggestions.suggestedColorScheme.textColor, color: suggestions.suggestedColorScheme.cardBackground}}>{suggestions.suggestedColorScheme.textColor}</span></p>
                    <p>Accent: <span className="font-mono px-1 py-0.5 rounded" style={{backgroundColor: suggestions.suggestedColorScheme.primaryColor, color: suggestions.suggestedColorScheme.cardBackground}}>{suggestions.suggestedColorScheme.primaryColor}</span></p>
                  </div>
                </div>
              )}
            </div>
            
            {suggestions.suggestedKeywordsForBackground && suggestions.suggestedKeywordsForBackground.length > 0 && (
              <div>
                <Label className="font-medium">Background Image Keywords:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {suggestions.suggestedKeywordsForBackground.map(keyword => (
                    <span key={keyword} className="text-xs p-2 bg-background rounded-full">{keyword}</span>
                  ))}
                </div>
              </div>
            )}

            {suggestions.actionableFeedback && suggestions.actionableFeedback.length > 0 && (
              <div>
                <Label className="font-medium flex items-center"><Info className="mr-1.5 h-4 w-4"/>Actionable Feedback:</Label>
                <ul className="list-disc list-inside text-sm p-2 bg-background rounded-md space-y-1 mt-1">
                  {suggestions.actionableFeedback.map((feedback, index) => (
                    <li key={index}>{feedback}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button onClick={handleApplyEnhancements} variant="default" className="w-full mt-4">Apply Enhancements</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
