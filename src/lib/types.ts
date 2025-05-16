
export interface UserProfile {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  twitter: string;
  github: string;
  address: string;
  profilePictureUrl?: string;
  cardBackgroundUrl?: string; // New: For card background image
  userInfo?: string; // For AI assistant
  targetAudience?: string; // For AI assistant
}

export interface CardDesignSettings {
  template: 'classic' | 'modern' | 'minimalist';
  layout: 'image-left' | 'image-right' | 'image-top';
  colorScheme: {
    cardBackground: string;
    textColor: string;
    primaryColor: string; // For accents on the card itself
  };
  qrCodeUrl: string; // This remains for internal use, like generating the public card URL
}

export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  profile: UserProfile;
  design: CardDesignSettings;
}

const defaultClassicProfile: UserProfile = {
  name: 'Jane Doe',
  title: 'Software Engineer',
  company: 'Tech Solutions Inc.',
  phone: '+1234567890',
  email: 'jane.doe@example.com',
  website: 'https://example.com',
  linkedin: 'linkedin.com/in/janedoe',
  twitter: 'twitter.com/janedoe',
  github: 'github.com/janedoe',
  address: '123 Main St, Anytown, USA',
  profilePictureUrl: `https://placehold.co/100x100.png`,
  cardBackgroundUrl: `https://placehold.co/600x900.png`, 
  userInfo: 'A software engineer passionate about web development and open source.',
  targetAudience: 'Tech recruiters, potential clients, and collaborators in the software industry.',
};

const defaultClassicDesign: CardDesignSettings = {
  template: 'classic',
  layout: 'image-left',
  colorScheme: {
    cardBackground: '#FFFFFF',
    textColor: '#333333',
    primaryColor: '#3F51B5', // Matches app primary
  },
  qrCodeUrl: '/card/classic-default',
};

const creativeProfessionalProfile: UserProfile = {
  name: 'Alex Creative',
  title: 'Photographer & Designer',
  company: 'Pixel Perfect Studios',
  phone: '+1-555-CREATIVE',
  email: 'alex@pixelperfect.art',
  website: 'https://pixelperfect.art',
  linkedin: 'linkedin.com/in/alexcreative',
  twitter: '@alexcreative',
  github: '',
  address: '789 Art Block, Design District',
  profilePictureUrl: `https://placehold.co/120x120.png`, 
  cardBackgroundUrl: `https://placehold.co/600x900.png`, 
  userInfo: 'Visual storyteller specializing in portrait photography and branding design. Loves vibrant colors and bold statements.',
  targetAudience: 'Art directors, gallery owners, individuals seeking creative visual services.',
};

const creativeProfessionalDesign: CardDesignSettings = {
  template: 'modern',
  layout: 'image-top',
  colorScheme: {
    cardBackground: '#F8F8F8', // Off-white
    textColor: '#2C3E50',    // Dark Slate Gray
    primaryColor: '#E74C3C', // Alizarin Crimson
  },
  qrCodeUrl: '/card/alex-creative',
};

const corporateExecutiveProfile: UserProfile = {
  name: 'Dr. Evelyn Reed',
  title: 'CEO & Strategic Consultant',
  company: 'Global Strategy Partners',
  phone: '+1-800-EXECUTIVE',
  email: 'e.reed@globalstrategy.com',
  website: 'https://globalstrategy.com',
  linkedin: 'linkedin.com/in/evelynreedceo',
  twitter: '',
  github: '',
  address: '1 Business Bay, Financial Center',
  profilePictureUrl: `https://placehold.co/100x100.png`,
  cardBackgroundUrl: `https://placehold.co/600x900.png`, 
  userInfo: 'Experienced CEO with a track record in business transformation and market growth. Focus on data-driven strategies.',
  targetAudience: 'Investors, board members, C-suite executives, industry leaders.',
};

const corporateExecutiveDesign: CardDesignSettings = {
  template: 'minimalist',
  layout: 'image-right',
  colorScheme: {
    cardBackground: '#0A2342', // Very Dark Blue
    textColor: '#EAEAEA',    // Light Gray
    primaryColor: '#A9BCD0', // Light Steel Blue for accent
  },
  qrCodeUrl: '/card/evelyn-reed',
};

export const appTemplates: AppTemplate[] = [
  {
    id: 'classic-default',
    name: 'Classic Default',
    description: 'A balanced and professional starting point.',
    profile: defaultClassicProfile,
    design: defaultClassicDesign,
  },
  {
    id: 'creative-pro',
    name: 'Creative Professional',
    description: 'Bold and visual, perfect for artists and designers.',
    profile: creativeProfessionalProfile,
    design: creativeProfessionalDesign,
  },
  {
    id: 'corporate-exec',
    name: 'Corporate Executive',
    description: 'Sleek and authoritative for business leaders.',
    profile: corporateExecutiveProfile,
    design: corporateExecutiveDesign,
  },
];

// These are kept for any direct usage but templates are preferred for initialization
export const defaultUserProfile: UserProfile = defaultClassicProfile;
export const defaultCardDesignSettings: CardDesignSettings = defaultClassicDesign;

    