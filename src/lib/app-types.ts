
// Renaming types.ts to app-types.ts to avoid conflict with native TS types
// And to specifically denote application-level type definitions.

export interface UserProfile { // This is for the card editor, not directly for dashboard users
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
  cardBackgroundUrl?: string;
  userInfo?: string; 
  targetAudience?: string;
}

export interface CardDesignSettings {
  template: 'classic' | 'modern' | 'minimalist';
  layout: 'image-left' | 'image-right' | 'image-top';
  colorScheme: {
    cardBackground: string;
    textColor: string;
    primaryColor: string;
  };
  qrCodeUrl: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  industry?: string;
  size?: string; 
  website?: string;
  address?: string;
  subscriptionPlanId: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  createdAt: string; // Using string for mock data simplicity, Date in real app
  updatedAt: string; // Using string for mock data simplicity, Date in real app
}

export interface Team {
  id: string;
  organizationId?: string; // Optional, for mock data simplicity
  name: string;
  description: string;
  memberUserIds?: string[]; // Simplified for now
  manager: string; // Simplified for mock data
  memberCount: number; // For display on teams page
  defaultTemplateId?: string; 
  createdAt?: string; 
  updatedAt?: string; 
}

export type UserRole = 'Admin' | 'Manager' | 'Employee';
export type UserStatus = 'Active' | 'Invited' | 'Inactive';

export interface AuthenticatedUser { // This type will be used for the dashboard user list
  id: string;
  organizationId?: string; 
  teamId?: string;        
  name: string;
  email: string;
  emailVerified?: boolean;
  role: UserRole;
  status: UserStatus;
  profilePictureUrl?: string; 
  title?: string; 
  phone?: string; 
  accessCode?: string; 
  accessCodeUsed?: boolean;
  onboardingCompleted?: boolean;
  lastLoginAt?: string; // Using string for mock data, Date in real app
  cardsCreatedCount?: number; // Example metric
  createdAt: string; 
  updatedAt?: string;
}

export interface BusinessCardData {
  id: string;
  userId: string; 
  organizationId?: string; 
  teamId?: string; 
  
  name: string;
  title: string;
  company?: string; 
  phone?: string;
  email: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  address?: string;
  profilePictureUrl?: string;
  cardBackgroundUrl?: string;
  userInfo?: string; 
  
  designSettings: CardDesignSettings; 

  viewCount?: number;
  scanCount?: number;
  shareCount?: number;

  isPublic?: boolean;
  publicUrlSlug?: string;

  createdAt: string; 
  updatedAt?: string; 
}


export interface CardTemplate {
  id: string;
  organizationId?: string; 
  name: string;
  description?: string;
  designSettings: CardDesignSettings; 
  isDefault?: boolean; 
  createdAt: string; 
  updatedAt?: string;
}

export interface AccessCode {
    code: string; 
    userId: string; 
    organizationId: string;
    isUsed: boolean;
    expiresAt?: string;
    createdAt: string;
}


export interface DashboardAnalytics {
  totalCardViews: number;
  weeklyCardViews: number;
  totalScans: number;
  weeklyScans: number;
  totalShares: number;
  weeklyShares: number;
  totalCards: number;
  totalUsers: number;
  planUsagePercent: number;
}

// Keep original AppTemplate for editor page if still used
export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  profile: UserProfile; // This UserProfile is for the card editor
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
    primaryColor: '#3F51B5', 
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
    cardBackground: '#F8F8F8', 
    textColor: '#2C3E50',    
    primaryColor: '#E74C3C', 
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
    cardBackground: '#0A2342', 
    textColor: '#EAEAEA',    
    primaryColor: '#A9BCD0', 
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


export const defaultUserProfile: UserProfile = defaultClassicProfile;
export const defaultCardDesignSettings: CardDesignSettings = defaultClassicDesign;
