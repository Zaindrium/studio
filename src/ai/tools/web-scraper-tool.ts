
'use server';
/**
 * @fileOverview A Genkit tool for basic web scraping.
 * - scrapeWebpageTool - A tool to fetch and extract text content from a URL.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScrapeWebpageInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage to scrape.'),
});

// Define the schema internally for the tool's use, but do not export it directly.
const ScrapeWebpageOutputSchema = z.object({
  scrapedText: z.string().optional().describe('The extracted text content from the webpage. May be truncated or limited.'),
  error: z.string().optional().describe('An error message if scraping failed.'),
  status: z.enum(['success', 'error', 'empty_content']).describe('The status of the scraping attempt.'),
});
// Exporting the Zod schema object directly from a 'use server' file is not allowed.
// Only types and async functions can be exported.

// Type export is fine.
export type ScrapeWebpageOutput = z.infer<typeof ScrapeWebpageOutputSchema>;


export const scrapeWebpageTool = ai.defineTool(
  {
    name: 'scrapeWebpageTool',
    description: "Fetches a webpage and attempts to extract its primary text content. Use this to get context from a user's provided website, LinkedIn, or GitHub page to help inform design suggestions. Note: This tool has limitations and may not work on all websites, especially those with heavy JavaScript rendering or login requirements (like LinkedIn). Results might be incomplete or just boilerplate text. Prioritize user-provided profile information if scraping is unsuccessful or provides poor results.",
    inputSchema: ScrapeWebpageInputSchema,
    outputSchema: ScrapeWebpageOutputSchema, // Use the internally defined schema
  },
  async ({url}): Promise<ScrapeWebpageOutput> => {
    try {
      // Ensure URL has a protocol
      let fullUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        fullUrl = `https://${url}`;
      }
      
      const response = await fetch(fullUrl, { 
        headers: {'User-Agent': 'LinkUP-AI-Assistant/1.0 LinkUPBot'}, // Basic user agent
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        return { error: `Failed to fetch URL (${response.status} ${response.statusText}). Ensure the URL is correct and publicly accessible.`, status: 'error' };
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        return { error: `URL does not appear to be an HTML page (content-type: ${contentType}).`, status: 'error' };
      }

      const html = await response.text();

      // Basic text extraction: remove script, style, and tags.
      let text = html.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      text = text.replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, '');
      text = text.replace(/<nav[^>]*>([\S\s]*?)<\/nav>/gmi, ''); // Remove navs
      text = text.replace(/<footer[^>]*>([\S\s]*?)<\/footer>/gmi, ''); // Remove footers
      text = text.replace(/<header[^>]*>([\S\s]*?)<\/header>/gmi, ''); // Remove headers
      text = text.replace(/<aside[^>]*>([\S\s]*?)<\/aside>/gmi, ''); // Remove asides
      text = text.replace(/<[^>]+>/g, ' '); 
      text = text.replace(/&nbsp;/gi, ' ');
      text = text.replace(/\s\s+/g, ' ').trim(); 

      const MAX_TEXT_LENGTH = 3000; 
      if (text.length > MAX_TEXT_LENGTH) {
        text = text.substring(0, MAX_TEXT_LENGTH) + '... [content truncated]';
      }

      if (!text || text.length < 50) { // Arbitrary short length to consider "empty"
        return { error: 'No meaningful text content found or content was too short. The page might be dynamic, require login, or block scraping.', scrapedText: text, status: 'empty_content' };
      }

      return { scrapedText: text, status: 'success' };
    } catch (e: any) {
      console.error(`Scraping error for ${url}:`, e);
      if (e.name === 'TimeoutError') {
        return { error: `Timeout while trying to scrape: ${url}`, status: 'error' };
      }
      return { error: `Error during scraping: ${e.message}. The URL might be invalid or the server unreachable.`, status: 'error' };
    }
  }
);
