
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
  createdAt: any; // Firestore Timestamp or string after fetch
  updatedAt: any; // Firestore Timestamp or string after fetch
}

// Represents an Admin User in Firebase
export type AdminRole = 'Owner' | 'Admin' | 'BillingManager';
export type UserStatus = 'Active' | 'Invited' | 'Inactive';

export interface AdminUser {
  id: string; // adminId (usually user.uid)
  companyId: string;
  companyName?: string; // For convenience, can be denormalized or fetched
  name: string;
  email: string;
  emailVerified?: boolean;
  role: AdminRole;
  status: UserStatus;
  profilePictureUrl?: string;
  lastLoginAt?: string | any; // string representation or Firestore Timestamp
  createdAt: string | any;    // string representation or Firestore Timestamp
  updatedAt?: string | any;   // string representation or Firestore Timestamp
}

// Represents a Staff Record in Firebase (managed by Admins, no login)
export type StaffRole = 'Employee' | 'Manager' | 'Contractor'
export interface StaffRecord {
  id: string;
  // companyId is implicit from the path: companies/{companyId}/staff/{staffId}
  name: string;
  email: string;
  role: StaffRole;
  teamId?: string;
  status: UserStatus;
  fingerprintUrl: string;
  uniqueNfcIdentifier?: string;
  assignedCardId?: string;
  cardsCreatedCount?: number;
  lastLoginAt?: string | any; // This might not be relevant if staff don't log in.
  createdAt: string | any;
  updatedAt?: string | any;
}


// Represents a Digital Business Card record in Firebase
export interface DigitalBusinessCardRecord {
  id: string; // cardId
  // companyId is implicit
  staffRecordId: string;
  templateId?: string;
  customFields?: Record<string, any>;
  cardData: StaffCardData;
  designSettings: CardDesignSettings;
  isActive: boolean;
  nfcTagId?: string;
  createdAt: any;
  updatedAt: any;
}

// Represents a Card Template record in Firebase
export interface CardTemplateRecord {
  id: string; // templateId
  // companyId is implicit
  name: string;
  description?: string;
  designSettings: CardDesignSettings;
  defaultFields?: Partial<StaffCardData>;
  isDefault?: boolean;
  createdAt: any;
  updatedAt: any;
}


export interface AccessCode {
    code: string;
    userId: string;
    companyId: string;
    isUsed: boolean;
    expiresAt?: string;
    createdAt: any;
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
  cardBackgroundUrl: ``, // Updated: Default no background
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
  cardBackgroundUrl: ``, // Updated: Default no background
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
// This specific `AuthenticatedAdminInfo` type is for the LOGGED-IN ADMIN USER's info,
// not for the list of staff they manage. For staff, use `StaffRecord`.
export interface AuthenticatedAdminInfo {
  id: string; // adminId / uid
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
  // organizationId is implicit from path: companies/{companyId}/teams/{teamId}
  name: string;
  description: string;
  memberUserIds?: string[]; // Array of StaffRecord IDs
  managerId?: string; // ID of the manager (StaffRecord ID or AdminUser ID)
  managerName?: string; // Name of the manager (denormalized for display)
  memberCount: number;
  defaultTemplateId?: string;
  createdAt?: any;
  updatedAt?: any;
}

// For Contact Collection on Public Card
export interface ContactInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  submittedFromCardId?: string; // fingerprintUrl of the card it was submitted from
  submittedAt: string | any; // ISO string or Firestore Timestamp
}

    