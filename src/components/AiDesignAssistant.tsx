
"use client";

import React, { useState, memo } from 'react'; // Added memo
import type { UserProfile, CardDesignSettings } from '@/lib/types';
import { proposeCardEnhancements, ProposeCardEnhancementsInput, ProposeCardEnhancementsOutput } from '@/ai/flows/propose-card-enhancements';
import { generateCardBackground, GenerateCardBackgroundInput, GenerateCardBackgroundOutput } from '@/ai/flows/generate-card-background-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Wand2, Lightbulb, Info, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AiDesignAssistantProps {
  userProfile: UserProfile;
  currentDesign: CardDesignSettings;
  onApplySuggestions: (updatedDesign: Partial<CardDesignSettings>) => void;
  onUpdateProfileForAI: (aiRelatedProfileData: Partial<UserProfile>) => void;
}

const AiDesignAssistantComponent = ({ userProfile, currentDesign, onApplySuggestions, onUpdateProfileForAI }: AiDesignAssistantProps) => {
  const [suggestions, setSuggestions] = useState<ProposeCardEnhancementsOutput | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
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
    setIsLoadingSuggestions(true);
    setSuggestions(null);
    try {
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
      setIsLoadingSuggestions(false);
    }
  };

  const handleApplyEnhancements = () => {
    if (!suggestions) return;

    if (suggestions.suggestedAboutMe) {
      onUpdateProfileForAI({ userInfo: suggestions.suggestedAboutMe });
    }

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
      description: "Card design and 'About Me' updated with AI recommendations.",
    });
  };

  const handleGenerateBackground = async () => {
    if (!suggestions || !suggestions.suggestedKeywordsForBackground || suggestions.suggestedKeywordsForBackground.length === 0) {
      toast({ title: "No Keywords", description: "AI needs keywords to generate a background.", variant: "destructive" });
      return;
    }
    setIsGeneratingBackground(true);
    try {
      const input: GenerateCardBackgroundInput = { 
        keywords: suggestions.suggestedKeywordsForBackground,
        existingColors: currentDesign.colorScheme 
      };
      const result = await generateCardBackground(input);
      if (result.imageDataUri) {
        onUpdateProfileForAI({ cardBackgroundUrl: result.imageDataUri });
        toast({ title: "AI Background Generated!", description: "New background image applied to your card." });
      } else {
        throw new Error("AI did not return image data.");
      }
    } catch (error) {
      console.error("AI background generation error:", error);
      toast({ title: "Background Generation Error", description: `Could not generate background: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
    } finally {
      setIsGeneratingBackground(false);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Sparkles className="mr-2 h-6 w-6 text-primary" />AI Card Enhancer</CardTitle>
        <CardDescription>
          Get AI-powered suggestions for your card's content, layout, colors, and even generate a background image!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            The AI uses your entire profile (including links for context if possible) to generate holistic suggestions. Ensure your profile details are up-to-date! LinkedIn profile pictures cannot be fetched automatically; please upload yours manually.
            Your "About Me" (Profession, Interests) and "Target Audience" fields below greatly help the AI.
          </AlertDescription>
        </Alert>
        
        <div className="p-3 border rounded-md bg-secondary/20 space-y-2">
            <Label className="font-medium text-sm">Current Info for AI:</Label>
            <p className="text-xs"><strong>Your Info:</strong> {userProfile.userInfo || <span className="italic text-muted-foreground">Not set in profile</span>}</p>
            <p className="text-xs"><strong>Target Audience:</strong> {userProfile.targetAudience || <span className="italic text-muted-foreground">Not set in profile</span>}</p>
        </div>


        <Button onClick={handleSuggestEnhancements} disabled={isLoadingSuggestions || isGeneratingBackground} className="w-full">
          <Wand2 className="mr-2 h-5 w-5" />
          {isLoadingSuggestions ? 'Getting Suggestions...' : 'Suggest Enhancements'}
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
              <div className="space-y-2">
                <Label className="font-medium">Background Image Keywords:</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.suggestedKeywordsForBackground.map(keyword => (
                    <span key={keyword} className="text-xs p-2 bg-background rounded-full">{keyword}</span>
                  ))}
                </div>
                <Button onClick={handleGenerateBackground} disabled={isGeneratingBackground || isLoadingSuggestions} className="w-full" variant="outline">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  {isGeneratingBackground ? 'Generating Background...' : 'Generate Background with AI'}
                </Button>
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

             {suggestions.scrapingNotes && suggestions.scrapingNotes.length > 0 && (
              <div>
                <Label className="font-medium flex items-center"><Info className="mr-1.5 h-4 w-4 text-amber-500"/>Web Scraping Notes:</Label>
                <ul className="list-disc list-inside text-xs p-2 bg-background/50 border border-amber-500/30 rounded-md space-y-1 mt-1 text-muted-foreground">
                  {suggestions.scrapingNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button onClick={handleApplyEnhancements} variant="default" className="w-full mt-4" disabled={isGeneratingBackground || isLoadingSuggestions}>Apply Suggested Text & Design</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const AiDesignAssistant = memo(AiDesignAssistantComponent);
