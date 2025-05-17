
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

// Represents an Organization/Company in Firebase
export interface CompanyProfile {
  id: string; // companyId
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Represents an Admin User in Firebase
export type AdminRole = 'Owner' | 'Admin' | 'BillingManager'; // Example roles for system admins
export type UserStatus = 'Active' | 'Invited' | 'Inactive';

export interface AdminUser { 
  id: string; // adminId
  companyId: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  role: AdminRole; 
  status: UserStatus;
  profilePictureUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Represents a Staff Record in Firebase (managed by Admins, no login)
// This is also used for the "Users" list in the dashboard.
export type StaffRole = 'Employee' | 'Manager' | 'Contractor' // Roles within the company for staff
export interface StaffRecord {
  id: string; 
  companyId?: string; // Optional if not strictly needed for mock display
  name: string;
  email: string; 
  role: StaffRole; // Role of the staff member in the company
  teamId?: string; // Team they belong to
  status: UserStatus; // 'Active', 'Invited', 'Inactive' status of their card/profile
  fingerprintUrl: string; // e.g., 'john-doe-unique-card-id' (should be URL safe)
  uniqueNfcIdentifier?: string; 
  assignedCardId?: string; 
  cardsCreatedCount?: number; // For dashboard display, actual count on their assigned card
  lastLoginAt?: string; // This might not be relevant if staff don't log in. Keep for consistency or remove.
  createdAt: string;
  updatedAt?: string;
}


// Represents a Digital Business Card record in Firebase
export interface DigitalBusinessCardRecord {
  id: string; // cardId
  companyId: string;
  staffRecordId: string; 
  templateId?: string; 
  customFields?: Record<string, any>; 
  cardData: StaffCardData; 
  designSettings: CardDesignSettings; 
  isActive: boolean; 
  nfcTagId?: string; 
  createdAt: string;
  updatedAt: string;
}

// Represents a Card Template record in Firebase
export interface CardTemplateRecord {
  id: string; // templateId
  companyId: string;
  name: string;
  description?: string;
  designSettings: CardDesignSettings; 
  defaultFields?: Partial<StaffCardData>; 
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface AccessCode { 
    code: string;
    userId: string; 
    companyId: string;
    isUsed: boolean;
    expiresAt?: string;
    createdAt: string;
}

// AppTemplate is used to initialize the card editor (now in Generator tab)
export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  profile: StaffCardData; 
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
  targetAudience: 'Clients and Partners',
};

const defaultClassicDesign: CardDesignSettings = {
  template: 'classic',
  layout: 'image-left',
  colorScheme: {
    cardBackground: '#FFFFFF',
    textColor: '#333333',
    primaryColor: '#3F51B5',
  },
  qrCodeUrl: '/card/classic-default-staff', 
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
  targetAudience: 'Creative Community',
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
// This specific `AuthenticatedUser` type is for the LOGGED-IN ADMIN USER's info,
// not for the list of staff they manage. For staff, use `StaffRecord`.
export interface AuthenticatedAdminInfo { 
  id: string;
  companyId: string; 
  organizationName: string; 
  name: string;
  email: string;
  role: AdminRole; 
  avatarUrl?: string;
}

// For Dashboard Teams list
export interface Team {
  id: string;
  organizationId?: string;
  name: string;
  description: string;
  memberUserIds?: string[];
  manager: string; 
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
