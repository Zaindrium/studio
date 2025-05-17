
// Renaming types.ts to app-types.ts to avoid conflict with native TS types
// And to specifically denote application-level type definitions.

// Data displayed ON a staff member's card
export interface StaffCardData {
  name: string;
  title: string;
  companyName?: string; // Company name on the card, might differ from the managing Company's name
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
  targetAudience?: string; // May or may not be relevant for admin-managed cards
}

export interface CardDesignSettings {
  template: 'classic' | 'modern' | 'minimalist';
  layout: 'image-left' | 'image-right' | 'image-top';
  colorScheme: {
    cardBackground: string;
    textColor: string;
    primaryColor: string;
  };
  qrCodeUrl: string; // This will be the unique fingerprint URL for the staff card
}

// Represents an Organization/Company in Firebase
export interface CompanyProfile {
  id: string; // companyId
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  address?: string;
  // branding: logoUrl, primaryColor, etc.
  // subscriptionPlanId: string; (Covered by useCurrentPlan for now)
  // subscriptionStatus: 'active' | 'inactive' | 'trial';
  createdAt: string;
  updatedAt: string;
}

// Represents an Admin User in Firebase
export type AdminRole = 'Owner' | 'Admin' | 'BillingManager'; // Example roles
export type UserStatus = 'Active' | 'Invited' | 'Inactive'; // Re-using for admins too

export interface AdminUser { // Was AuthenticatedUser
  id: string; // adminId
  companyId: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  role: AdminRole; // Specific admin roles
  status: UserStatus;
  profilePictureUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Represents a Staff Record in Firebase (managed by Admins, no login)
export interface StaffRecord {
  id: string; // staffId
  companyId: string;
  name: string;
  email: string; // For contact, not login
  title?: string;
  team?: string; // Team name or ID
  status: 'Active' | 'Inactive'; // Card activation status
  uniqueNfcIdentifier?: string; // For linking to a physical NFC tag
  fingerprintUrl: string; // e.g., {businessName}/{uniqueStaffId}/{staffInitials}
  assignedCardId?: string; // Reference to the DigitalBusinessCardRecord
  createdAt: string;
  updatedAt: string;
}

// Represents a Digital Business Card record in Firebase
export interface DigitalBusinessCardRecord {
  id: string; // cardId
  companyId: string;
  staffRecordId: string; // Link to StaffRecord
  templateId?: string; // Link to CardTemplateRecord
  customFields?: Record<string, any>; // For any overrides or additional card-specific data
  cardData: StaffCardData; // The actual content to display on the card
  designSettings: CardDesignSettings; // The design to apply
  isActive: boolean; // Master switch for the card
  nfcTagId?: string; // Physical NFC tag identifier if linked
  createdAt: string;
  updatedAt: string;
}

// Represents a Card Template record in Firebase
export interface CardTemplateRecord {
  id: string; // templateId
  companyId: string;
  name: string;
  description?: string;
  designSettings: CardDesignSettings; // Base design
  defaultFields?: Partial<StaffCardData>; // Pre-filled fields for cards using this template
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface AccessCode { // For inviting new Admins or other purposes
    code: string;
    userId: string; // Could be adminId
    companyId: string;
    isUsed: boolean;
    expiresAt?: string;
    createdAt: string;
}

// Mock data for editor page, now using StaffCardData
export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  profile: StaffCardData; // Changed from UserProfile
  design: CardDesignSettings;
}


// --- Mock Data for App ---
const defaultClassicStaffCard: StaffCardData = {
  name: 'Jane Doe (Staff)',
  title: 'Sales Representative',
  companyName: 'Example Corp',
  phone: '+1234567890',
  email: 'jane.staff@example.com',
  website: 'https://example.com/jane',
  linkedin: 'linkedin.com/in/janestaff',
  twitter: '@janestaff',
  github: '',
  address: '123 Business Rd, Suite 100',
  profilePictureUrl: `https://placehold.co/100x100.png`,
  cardBackgroundUrl: ``,
  userInfo: 'Dedicated sales professional helping businesses grow.',
};

const defaultClassicDesign: CardDesignSettings = {
  template: 'classic',
  layout: 'image-left',
  colorScheme: {
    cardBackground: '#FFFFFF',
    textColor: '#333333',
    primaryColor: '#3F51B5',
  },
  qrCodeUrl: '/card/classic-default-staff', // Needs to be unique per card
};

const creativeProfessionalStaffCard: StaffCardData = {
  name: 'Alex Creative (Staff)',
  title: 'Marketing Specialist',
  companyName: 'Example Corp Marketing',
  phone: '+1-555-DESIGN',
  email: 'alex.creative@example.com',
  website: 'https://example.com/marketing',
  linkedin: 'linkedin.com/in/alexcreativemarketing',
  twitter: '@creativealex',
  github: '',
  address: '456 Art Avenue, Creative City',
  profilePictureUrl: `https://placehold.co/120x120.png`,
  cardBackgroundUrl: ``,
  userInfo: 'Innovative marketing specialist driving brand engagement.',
};

const creativeProfessionalDesign: CardDesignSettings = {
  template: 'modern',
  layout: 'image-top',
  colorScheme: {
    cardBackground: '#F8F8F8',
    textColor: '#2C3E50',
    primaryColor: '#E74C3C',
  },
  qrCodeUrl: '/card/alex-creative-staff',
};

export const appTemplates: AppTemplate[] = [
  {
    id: 'classic-default-staff',
    name: 'Staff Classic Default',
    description: 'A balanced and professional starting point for staff cards.',
    profile: defaultClassicStaffCard,
    design: defaultClassicDesign,
  },
  {
    id: 'creative-pro-staff',
    name: 'Staff Creative Professional',
    description: 'Bold and visual, perfect for creative staff members.',
    profile: creativeProfessionalStaffCard,
    design: creativeProfessionalDesign,
  },
];

export const defaultStaffCardData: StaffCardData = defaultClassicStaffCard;
export const defaultCardDesignSettings: CardDesignSettings = defaultClassicDesign;


// For Dashboard User/Admin list display
// Re-using UserRole and UserStatus for general user display, though AdminUser has AdminRole
export type UserRole = 'Admin' | 'Manager' | 'Employee'; // General purpose for display in dashboard lists

export interface AuthenticatedUser { // This type is used for the dashboard *logged-in admin's* mock data.
  id: string;
  companyId: string; // Company this admin belongs to
  organizationName: string; // Company name for display
  name: string;
  email: string;
  role: AdminRole; // Specific admin role
  avatarUrl?: string;
  // Other fields from AdminUser can be added as needed for the dashboard's display of the logged-in user.
}

// For Dashboard Teams list
export interface Team {
  id: string;
  organizationId?: string;
  name: string;
  description: string;
  memberUserIds?: string[];
  manager: string; // Name of the manager
  memberCount: number;
  defaultTemplateId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// For Contact Collection on Public Card
export interface ContactInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  submittedFromCardId?: string;
  submittedAt: string;
}
