
// Renaming types.ts to app-types.ts to avoid conflict with native TS types
// And to specifically denote application-level type definitions.

// Existing UserProfile and CardDesignSettings might be reused or adapted
// For now, these are new types for the business dashboard context.

export interface OrganizationProfile {
  id: string;
  name: string;
  industry?: string;
  size?: string; // e.g., "1-10 employees", "11-50 employees"
  website?: string;
  address?: string; // Could be a more structured address object
  // ... other company details
  subscriptionPlanId: string; // e.g., 'starter', 'growth', 'enterprise'
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  managerUserIds: string[]; // IDs of users who are managers of this team
  memberUserIds: string[];
  defaultTemplateId?: string; // Optional template assigned to this team
  createdAt: Date;
  updatedAt: Date;
}

// Extending existing UserProfile or creating a new one for authenticated users
export interface AuthenticatedUser {
  id: string;
  organizationId?: string; // Optional: Personal accounts might not have this
  teamId?: string;         // Optional: Users might not be in a team
  name: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string; // NEVER store plain text passwords
  role: 'admin' | 'manager' | 'employee' | 'personal_user';
  profilePictureUrl?: string; // Reusing from existing UserProfile type
  title?: string; // Reusing from existing UserProfile type
  phone?: string; // Reusing from existing UserProfile type
  accessCode?: string; // For employee first-time login
  accessCodeUsed?: boolean;
  onboardingCompleted: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Reusing or adapting existing UserProfile for card data
// This might need to be linked to an AuthenticatedUser
export interface BusinessCardData {
  id: string;
  userId: string; // The AuthenticatedUser who owns/created this card
  organizationId?: string; // If it's an organizational card
  teamId?: string; // If it's tied to a specific team
  
  // Core profile info for the card (can be different from user's account info)
  name: string;
  title: string;
  company?: string; // Could be pre-filled from OrganizationProfile for business users
  phone?: string;
  email: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  address?: string;
  profilePictureUrl?: string;
  cardBackgroundUrl?: string;
  userInfo?: string; // About me
  
  // Design settings - reusing existing CardDesignSettings
  designSettings: CardDesignSettings; // Imported or redefined from existing types.ts

  // Analytics (placeholders, actual tracking would be complex)
  viewCount: number;
  scanCount: number;
  shareCount: number;

  isPublic: boolean;
  publicUrlSlug: string; // e.g., "john-doe-techcorp"

  createdAt: Date;
  updatedAt: Date;
}

// Reusing existing CardDesignSettings
export interface CardDesignSettings {
  template: 'classic' | 'modern' | 'minimalist'; // Example values
  layout: 'image-left' | 'image-right' | 'image-top';
  colorScheme: {
    cardBackground: string;
    textColor: string;
    primaryColor: string;
  };
  // qrCodeUrl is specific to the old system, might be deprecated or dynamically generated
}


export interface CardTemplate {
  id: string;
  organizationId: string; // Templates belong to an organization
  name: string;
  description?: string;
  designSettings: CardDesignSettings; // Pre-defined design for the template
  isDefault?: boolean; // Is it a default org template?
  createdAt: Date;
  updatedAt: Date;
}

// AccessCode would likely be a simpler structure, perhaps directly on the User or a separate small table
export interface AccessCode {
    code: string; // The unique code itself
    userId: string; // User this code is for
    organizationId: string;
    isUsed: boolean;
    expiresAt?: Date;
    createdAt: Date;
}


// Placeholder for analytics data structure
export interface DashboardAnalytics {
  totalCardViews: number;
  weeklyCardViews: number;
  totalScans: number;
  weeklyScans: number;
  totalShares: number;
  weeklyShares: number;
  totalCards: number;
  totalUsers: number;
  planUsagePercent: number; // e.g., 75 for 75%
}
