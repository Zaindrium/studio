
'use server';
/**
 * @fileOverview An AI agent that proposes comprehensive enhancements for a digital business card,
 * potentially using scraped content from user-provided URLs.
 *
 * - proposeCardEnhancements - A function that suggests content, layout, colors, and other improvements.
 * - ProposeCardEnhancementsInput - The input type for the proposeCardEnhancements function.
 * - ProposeCardEnhancementsOutput - The return type for the proposeCardEnhancements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UserProfile } from '@/lib/types'; // This type might need adjustment if it also included twitter/github
// Import only the tool function and the output type, not the schema object directly from the 'use server' tool file.
import { scrapeWebpageTool, type ScrapeWebpageOutput } from '@/ai/tools/web-scraper-tool';

// Define the input schema based on StaffCardData fields relevant to the AI
const ProposeCardEnhancementsInputSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional().describe("User's personal or company website URL."),
  linkedin: z.string().optional().describe("User's LinkedIn profile URL."),
  // twitter: z.string().optional().describe("User's Twitter profile URL (content not scraped)."), // Removed
  // github: z.string().optional().describe("User's GitHub profile URL."), // Removed
  address: z.string().optional(),
  profilePictureUrl: z.string().optional().or(z.literal('')),
  cardBackgroundUrl: z.string().optional().or(z.literal('')),
  userInfo: z.string().optional().describe('Existing "About Me" text or user interests/profession.'),
  targetAudience: z.string().optional().describe('The intended audience for this card.'),
});
export type ProposeCardEnhancementsInput = z.infer<typeof ProposeCardEnhancementsInputSchema>;


const ProposeCardEnhancementsOutputSchema = z.object({
  suggestedAboutMe: z.string().describe("A concise and compelling 'About Me' text for the business card, generated based on the user's profile and any scraped content. Keep it under 200 characters."),
  suggestedLayout: z.enum(['image-left', 'image-right', 'image-top']).describe("The suggested layout for the card (position of the profile image)."),
  suggestedColorScheme: z.object({
    cardBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color code").describe("Suggested card background color (e.g., #FFFFFF)."),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color code").describe("Suggested text color (e.g., #000000)."),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color code").describe("Suggested accent color for links and highlights (e.g., #007BFF)."),
  }).describe("Specific color suggestions for the card."),
  suggestedKeywordsForBackground: z.array(z.string()).max(3).describe("Keywords or themes for a background image, if the user wants to find/upload one (e.g., 'professional cityscape', 'minimalist texture', 'vibrant abstract'). Limit to 3 keywords.").optional(),
  actionableFeedback: z.array(z.string()).max(2).describe("Suggestions for additional information the user might want to include or ways to improve their card. Limit to 2 suggestions.").optional(),
  scrapingNotes: z.array(z.string()).optional().describe("Notes regarding the success or failure of scraping provided URLs."),
});
export type ProposeCardEnhancementsOutput = z.infer<typeof ProposeCardEnhancementsOutputSchema>;

export async function proposeCardEnhancements(input: ProposeCardEnhancementsInput): Promise<ProposeCardEnhancementsOutput> {
  return proposeCardEnhancementsFlow(input);
}

// Re-define the ScrapeWebpageOutputSchema locally for use in this flow's PromptInputSchema.
const LocalScrapeWebpageOutputSchema = z.object({
  scrapedText: z.string().optional().describe('The extracted text content from the webpage. May be truncated or limited.'),
  error: z.string().optional().describe('An error message if scraping failed.'),
  status: z.enum(['success', 'error', 'empty_content']).describe('The status of the scraping attempt.'),
});

// Define a schema for the data that will be passed to the prompt, including scraped content
const PromptInputSchema = ProposeCardEnhancementsInputSchema.extend({
  websiteScrapedContent: LocalScrapeWebpageOutputSchema.optional().describe('Scraped content from the user\'s website URL.'),
  linkedinScrapedContent: LocalScrapeWebpageOutputSchema.optional().describe('Scraped content from the user\'s LinkedIn URL.'),
  // githubScrapedContent: LocalScrapeWebpageOutputSchema.optional().describe('Scraped content from the user\'s GitHub URL.'), // Removed
});
type PromptInput = z.infer<typeof PromptInputSchema>;


const prompt = ai.definePrompt({
  name: 'proposeCardEnhancementsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: ProposeCardEnhancementsOutputSchema},
  prompt: `You are an expert AI assistant specializing in designing compelling digital business cards.
Analyze the user's profile information AND any scraped content from their provided URLs (Website, LinkedIn) to generate suggestions.

User Profile:
- Name: {{name}}
- Title: {{title}}
- Company: {{company}}
- Email: {{email}}
- Phone: {{phone}}
- Website: {{website}}
{{#if websiteScrapedContent}}
  - Website Content Snippet (Status: {{websiteScrapedContent.status}}): 
    {{#if websiteScrapedContent.scrapedText}}"{{{websiteScrapedContent.scrapedText}}}"{{else}}"N/A"{{/if}}
  {{#if websiteScrapedContent.error}} (Note: {{websiteScrapedContent.error}}){{/if}}
{{/if}}
- LinkedIn: {{linkedin}}
{{#if linkedinScrapedContent}}
  - LinkedIn Content Snippet (Status: {{linkedinScrapedContent.status}}):
    {{#if linkedinScrapedContent.scrapedText}}"{{{linkedinScrapedContent.scrapedText}}}"{{else}}"N/A"{{/if}}
  {{#if linkedinScrapedContent.error}} (Note: {{linkedinScrapedContent.error}}){{/if}}
{{/if}}
- Address: {{address}}
- Current 'About Me'/Interests: {{userInfo}}
- Target Audience: {{targetAudience}}
- Has Profile Picture: {{#if profilePictureUrl}}Yes{{else}}No{{/if}}
- Has Card Background Image: {{#if cardBackgroundUrl}}Yes{{else}}No{{/if}}

Your tasks are to:
1.  **Suggest "About Me" Text:** Based on the *entire profile*, including scraped content if useful, generate a concise and professional "About Me" text (under 200 characters). If 'userInfo' is provided, refine it. If scraped content from LinkedIn (e.g., a summary) or a personal website (e.g., an intro paragraph) is high quality, leverage it. If scraping failed or returned poor content (like a login page), rely more on the user's direct input for 'userInfo' and other profile fields.
2.  **Suggest Layout:** Choose one of 'image-left', 'image-right', or 'image-top'. Consider the user's profession (e.g., creative vs. corporate) which might be inferred from their profile or scraped content.
3.  **Suggest Color Scheme:** Provide hex codes for 'cardBackground', 'textColor', and 'primaryColor'. Consider common color psychologies for the target audience. If a card background image is present, or if scraped website content hints at existing branding, suggest colors that would complement it.
4.  **Suggest Keywords for Background (Optional):** If the user doesn't have a background or wants ideas, suggest 2-3 keywords or themes. These can be inspired by their profession, interests, or themes from their website.
5.  **Provide Actionable Feedback (Optional):** Offer 1-2 brief suggestions. This could be about missing info or leveraging something from their scraped content.

Prioritize information directly provided by the user if scraped content is unavailable, nonsensical (e.g., login page text, HTML boilerplate), or very limited.
If scraped content IS available and seems relevant, use it to make your suggestions more specific and insightful.
Ensure your output strictly adheres to the defined JSON schema. For colors, always provide valid 6-digit hex codes.
Keep suggestions practical and professional.
Output scrapingNotes to summarize any significant issues encountered during scraping (e.g., "Could not access LinkedIn profile.", "Website content was very brief.").
`,
});

const proposeCardEnhancementsFlow = ai.defineFlow(
  {
    name: 'proposeCardEnhancementsFlow',
    inputSchema: ProposeCardEnhancementsInputSchema,
    outputSchema: ProposeCardEnhancementsOutputSchema,
  },
  async (input: ProposeCardEnhancementsInput) => {
    const promptInput: PromptInput = { ...input };
    const scrapingNotes: string[] = [];

    if (input.website) {
      try {
        const result = await scrapeWebpageTool({ url: input.website });
        promptInput.websiteScrapedContent = result;
        if (result.status === 'error') scrapingNotes.push(`Website (${input.website}): ${result.error}`);
        else if (result.status === 'empty_content') scrapingNotes.push(`Website (${input.website}): ${result.error || 'Content was minimal or not found.'}`);
      } catch (e: any) {
        promptInput.websiteScrapedContent = { error: `Scraping tool error: ${e.message}`, status: 'error' };
        scrapingNotes.push(`Website (${input.website}): Tool invocation error - ${e.message}`);
      }
    }
    if (input.linkedin) {
       try {
        const result = await scrapeWebpageTool({ url: input.linkedin });
        promptInput.linkedinScrapedContent = result;
        if (result.status === 'error') scrapingNotes.push(`LinkedIn (${input.linkedin}): ${result.error}`);
        else if (result.status === 'empty_content') scrapingNotes.push(`LinkedIn (${input.linkedin}): ${result.error || 'Content was minimal or not found (LinkedIn often blocks scraping).'}`);
      } catch (e: any) {
        promptInput.linkedinScrapedContent = { error: `Scraping tool error: ${e.message}`, status: 'error' };
        scrapingNotes.push(`LinkedIn (${input.linkedin}): Tool invocation error - ${e.message}`);
      }
    }
    // GitHub scraping removed

    const {output} = await prompt(promptInput);
    if (!output) {
        throw new Error("AI failed to generate enhancement suggestions.");
    }
    
    output.suggestedKeywordsForBackground = output.suggestedKeywordsForBackground || [];
    output.actionableFeedback = output.actionableFeedback || [];
    output.scrapingNotes = scrapingNotes.length > 0 ? scrapingNotes : undefined; 

    return output;
  }
);
