
'use server';
/**
 * @fileOverview An AI agent that generates a background image for a digital business card
 * based on provided keywords.
 *
 * - generateCardBackground - A function that handles the image generation process.
 * - GenerateCardBackgroundInput - The input type for the generateCardBackground function.
 * - GenerateCardBackgroundOutput - The return type for the generateCardBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCardBackgroundInputSchema = z.object({
  keywords: z.array(z.string()).min(1).describe('An array of keywords to inspire the background image. Should not be empty.'),
  existingColors: z.object({
    cardBackground: z.string().optional(),
    textColor: z.string().optional(),
    primaryColor: z.string().optional(),
  }).optional().describe('Optional existing card colors to help the AI generate a complementary background.'),
});
export type GenerateCardBackgroundInput = z.infer<typeof GenerateCardBackgroundInputSchema>;

const GenerateCardBackgroundOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateCardBackgroundOutput = z.infer<typeof GenerateCardBackgroundOutputSchema>;

export async function generateCardBackground(input: GenerateCardBackgroundInput): Promise<GenerateCardBackgroundOutput> {
  return generateCardBackgroundFlow(input);
}

const generateCardBackgroundFlow = ai.defineFlow(
  {
    name: 'generateCardBackgroundFlow',
    inputSchema: GenerateCardBackgroundInputSchema,
    outputSchema: GenerateCardBackgroundOutputSchema,
  },
  async ({ keywords, existingColors }) => {
    let promptText = `Generate a visually appealing, professional, and primarily abstract background image suitable for a digital business card.
The image should be inspired by the following themes or keywords: "${keywords.join(", ")}".
The image needs to be subtle enough to allow text to be clearly readable when overlaid on top. Avoid busy patterns or overly dominant focal points.
The image should be vertically oriented (portrait).`;

    if (existingColors) {
      promptText += `\nConsider complementing these existing card colors if possible:
      - Current Background (if any, to avoid clashing if this is a subtle overlay): ${existingColors.cardBackground || 'N/A'}
      - Text Color: ${existingColors.textColor || 'N/A'}
      - Accent Color: ${existingColors.primaryColor || 'N/A'}`;
    }


    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Ensure this model supports image generation
      prompt: promptText,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include IMAGE for generation
         safetySettings: [ // Relax safety settings slightly for more creative outputs if needed, be mindful
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
       output: {
        format: 'json', // Though we primarily want the image, some text output might occur.
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate an image or image data was not found.');
    }
    
    // Gemini 2.0 Flash Exp should return a data URI directly in media.url
    if (!media.url.startsWith('data:image')) {
        throw new Error(`Generated media URL is not a valid data URI: ${media.url}`);
    }

    return { imageDataUri: media.url };
  }
);

