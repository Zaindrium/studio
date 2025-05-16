
import { config } from 'dotenv';
config();

// import '@/ai/flows/suggest-design.ts'; // Old flow, will be removed
import '@/ai/flows/propose-card-enhancements.ts'; // New flow
import '@/ai/tools/web-scraper-tool.ts'; // Import the new tool
import '@/ai/flows/generate-card-background-flow.ts'; // Import new background generation flow
