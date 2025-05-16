
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sanitizeForUrl = (name: string | undefined) => { // Allow name to be undefined
  if (!name) return 'my-card';
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'my-card';
};

export const ensureHttps = (url: string | undefined): string => { // Allow url to be undefined
  if (!url) return "";
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Basic check for a valid-looking domain before prepending https
  // This avoids prepending https to things like plain text or phone numbers
  if (url.includes('.') && !url.includes(' ') && !url.startsWith('mailto:') && !url.startsWith('tel:')) { 
    return `https://${url}`;
  }
  return url; // Return original if it doesn't look like a web URL needing https
};
