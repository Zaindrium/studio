
'use server';
/**
 * @fileOverview An AI agent that proposes comprehensive enhancements for a digital business card.
 *
 * - proposeCardEnhancements - A function that suggests content, layout, colors, and other improvements.
 * - ProposeCardEnhancementsInput - The input type for the proposeCardEnhancements function.
 * - ProposeCardEnhancementsOutput - The return type for the proposeCardEnhancements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserProfile } from '@/lib/types'; // Use existing UserProfile type for input

// Define the input schema based on UserProfile fields relevant to the AI
const ProposeCardEnhancementsInputSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  address: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  cardBackgroundUrl: z.string().optional(),
  userInfo: z.string().optional().describe('Existing "About Me" text or user interests/profession.'),
  targetAudience: z.string().optional().describe('The intended audience for this card.'),
});
export type ProposeCardEnhancementsInput = z.infer<typeof ProposeCardEnhancementsInputSchema>;


const ProposeCardEnhancementsOutputSchema = z.object({
  suggestedAboutMe: z.string().describe("A concise and compelling 'About Me' text for the business card, generated based on the user's profile. Keep it under 150 characters."),
  suggestedLayout: z.enum(['image-left', 'image-right', 'image-top']).describe("The suggested layout for the card (position of the profile image)."),
  suggestedColorScheme: z.object({
    cardBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color code").describe("Suggested card background color (e.g., #FFFFFF)."),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color code").describe("Suggested text color (e.g., #000000)."),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color code").describe("Suggested accent color for links and highlights (e.g., #007BFF)."),
  }).describe("Specific color suggestions for the card."),
  suggestedKeywordsForBackground: z.array(z.string()).describe("Keywords or themes for a background image, if the user wants to find/upload one (e.g., 'professional cityscape', 'minimalist texture', 'vibrant abstract'). Limit to 3 keywords.").optional(),
  actionableFeedback: z.array(z.string()).describe("Suggestions for additional information the user might want to include or ways to improve their card. Limit to 2 suggestions.").optional(),
});
export type ProposeCardEnhancementsOutput = z.infer<typeof ProposeCardEnhancementsOutputSchema>;

export async function proposeCardEnhancements(input: ProposeCardEnhancementsInput): Promise<ProposeCardEnhancementsOutput> {
  return proposeCardEnhancementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'proposeCardEnhancementsPrompt',
  input: {schema: ProposeCardEnhancementsInputSchema},
  output: {schema: ProposeCardEnhancementsOutputSchema},
  prompt: `You are an expert AI assistant specializing in designing compelling digital business cards.
Based on the following user profile information, provide suggestions to enhance their card.

User Profile:
- Name: {{name}}
- Title: {{title}}
- Company: {{company}}
- Email: {{email}}
- Phone: {{phone}}
- Website: {{website}}
- LinkedIn: {{linkedin}}
- Twitter: {{twitter}}
- GitHub: {{github}}
- Address: {{address}}
- Current 'About Me'/Interests: {{userInfo}}
- Target Audience: {{targetAudience}}
- Has Profile Picture: {{#if profilePictureUrl}}Yes{{else}}No{{/if}}
- Has Card Background Image: {{#if cardBackgroundUrl}}Yes{{else}}No{{/if}}

Your tasks are to:
1.  **Suggest "About Me" Text:** Generate a concise and professional "About Me" text (under 150 characters). If the user provided 'userInfo', refine it or create a new one if 'userInfo' is more like keywords.
2.  **Suggest Layout:** Choose one of 'image-left', 'image-right', or 'image-top' for the profile picture placement.
3.  **Suggest Color Scheme:** Provide hex codes for 'cardBackground', 'textColor', and 'primaryColor'. Consider common color psychologies for the target audience. If a card background image is present, suggest colors that would complement it.
4.  **Suggest Keywords for Background (Optional):** If the user doesn't have a background image or might want ideas, suggest 2-3 keywords or themes (e.g., "modern geometric", "nature abstract", "dark tech").
5.  **Provide Actionable Feedback (Optional):** Offer 1-2 brief suggestions for information the user might be missing or could add to make their card more effective for their target audience (e.g., "Consider adding your GitHub if you're a developer targeting tech roles.").

Ensure your output strictly adheres to the defined JSON schema.
For colors, always provide valid 6-digit hex codes starting with #.
Keep suggestions practical and professional.
`,
});

const proposeCardEnhancementsFlow = ai.defineFlow(
  {
    name: 'proposeCardEnhancementsFlow',
    inputSchema: ProposeCardEnhancementsInputSchema,
    outputSchema: ProposeCardEnhancementsOutputSchema,
  },
  async (input: ProposeCardEnhancementsInput) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate enhancement suggestions.");
    }
    // Ensure keywords and feedback are arrays even if empty, to match schema
    output.suggestedKeywordsForBackground = output.suggestedKeywordsForBackground || [];
    output.actionableFeedback = output.actionableFeedback || [];
    return output;
  }
);
