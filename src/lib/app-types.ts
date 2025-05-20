
// src/lib/app-types.ts
import type { Timestamp } from 'firebase/firestore';

export type PlanId = 'free' | 'starter' | 'growth' | 'enterprise';

// Data displayed ON a staff member's card
export interface StaffCardData {
  name: string;
  prefix?: string; // New
  suffix?: string; // New
  preferredName?: string; // New
  maidenName?: string; // New
  pronouns?: string; // New
  accreditations?: string; // New
  title: string;
  companyName?: string;
  companyLogoUrl?: string; // Can be a URL or dataURI
  phone?: string;
  email: string;
  website?: string;
  linkedin?: string;
  address?: string;
  profilePictureUrl?: string; // Can be a URL or dataURI
  cardBackgroundUrl?: string; // Can be a URL or dataURI
  userInfo?: string;
  targetAudience?: string;
}

export interface CardDesignSettings {
  template: string; // ID of the AppCardTemplate used
  layout: 'image-left' | 'image-right' | 'image-top';
  colorScheme: {
    cardBackground: string;
    textColor: string;
    primaryColor: string;
  };
  qrCodeUrl: string;
  aiHint?: string; // For AI-generated background suggestions
}

// Represents an Organization/Company in Firebase
export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string; // dataURI or URL from storage
  industry?: string;
  size?: string;
  website?: string;
  address?: string;
  activePlanId: PlanId;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// Represents an Admin User in Firebase
export type AdminRole = 'Owner' | 'Admin' | 'BillingManager';
export type UserStatus = 'Active' | 'Invited' | 'Inactive';

export interface AdminUser {
  id: string; // adminId (usually user.uid)
  companyId: string;
  companyName?: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  role: AdminRole;
  status: UserStatus;
  profilePictureUrl?: string;
  lastLoginAt?: Timestamp | string | null;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export type StaffRole = 'Employee' | 'Manager' | 'Contractor';
export interface StaffRecord {
  id: string; // Firestore document ID
  name: string;
  email: string;
  role: StaffRole;
  teamId?: string;
  status: UserStatus;
  fingerprintUrl: string; // Unique URL segment for the public card
  uniqueNfcIdentifier?: string; // For physical NFC card linking
  cardDisplayData: StaffCardData;
  designSettings: CardDesignSettings;
  cardsCreatedCount?: number;
  lastLoginAt?: Timestamp | string | null;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface CardTemplateRecord {
  id: string; // templateId
  name: string;
  description: string;
  designSettings: CardDesignSettings;
  defaultFields?: Partial<StaffCardData>;
  isPublic?: boolean;
  companyId?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}


export interface AccessCode {
    code: string;
    staffMemberEmail: string; // Email of the staff member this code is for
    companyId: string;
    isUsed: boolean;
    expiresAt?: Timestamp | string;
    createdAt: Timestamp | string;
}

export const defaultStaffCardData: StaffCardData = {
  name: '',
  prefix: '',
  suffix: '',
  preferredName: '',
  maidenName: '',
  pronouns: '',
  accreditations: '',
  title: '',
  companyName: '',
  companyLogoUrl: '',
  phone: '',
  email: '',
  website: '',
  linkedin: '',
  address: '',
  profilePictureUrl: `https://placehold.co/120x120.png`, 
  cardBackgroundUrl: '',
  userInfo: '',
  targetAudience: '',
};

export const defaultCardDesignSettings: CardDesignSettings = {
  template: 'tech-innovator', // Default to one of the templates
  layout: 'image-left',
  colorScheme: {
    cardBackground: '#1A202C', 
    textColor: '#E2E8F0',    
    primaryColor: '#3B82F6', 
  },
  qrCodeUrl: '',
  aiHint: "tech abstract",
};

export interface Team {
  id: string;
  name: string;
  description: string;
  managerId?: string | null; 
  managerName?: string | null; 
  memberUserIds?: string[];
  memberCount?: number;
  assignedTemplates?: AssignedTemplate[];
  teamMetrics?: TeamMetrics;
  defaultTemplateId?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface AssignedTemplate {
  id: string;
  name: string;
}

export interface TeamMetrics {
  cardsCreated: number;
  averageSharesPerCard: number;
  leadsGenerated: number;
  activeMembers: number;
}

export interface DetailedTeam extends Team {
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  cardsCreatedCount?: number;
  averageSharesPerCard?: number;
}

export interface ContactInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  submittedFromCardId?: string;
  submittedToCompanyId?: string; 
  submittedAt: Timestamp | string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  companyId: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}
export interface RolePermission {
  id: string;
  name: string;
  description: string;
}


export interface AppPlan {
  id: PlanId;
  name: string;
  price: string; 
  priceMonthly: number; 
  currencySymbol: string; 
  frequency: string; 
  staffIncluded: string; 
  userLimit: number; 
  features: string[];
  extraStaffCost?: string; 
  extraStaffUnit?: string; 
  isBusiness: boolean;
  popular?: boolean;
  description?: string;
}

export const APP_PLANS: AppPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 'R59',
    priceMonthly: 59,
    currencySymbol: 'R',
    frequency: '/ month',
    staffIncluded: '1 (Solo)',
    userLimit: 1,
    features: ['1 Digital card', 'QR/NFC sharing', 'Admin dashboard access', 'Basic templates', 'VCF download'],
    isBusiness: false,
    description: "For solopreneurs and individuals needing a professional digital presence.",
  },
  {
    id: 'starter', 
    name: 'Business Starter',
    price: 'R249',
    priceMonthly: 249,
    currencySymbol: 'R',
    frequency: '/ month',
    staffIncluded: 'Up to 5 Staff',
    userLimit: 5,
    features: ['All Starter features', 'Up to 5 unique cards', 'Team grouping (basic)', 'Company branding and logo', 'Basic analytics'],
    extraStaffCost: 'R39',
    extraStaffUnit: '/month each',
    isBusiness: true,
    description: "Designed for small businesses and teams looking to manage multiple digital cards.",
  },
  {
    id: 'growth', 
    name: 'Business Growth',
    price: 'R499',
    priceMonthly: 499,
    currencySymbol: 'R',
    frequency: '/ month',
    staffIncluded: 'Up to 15 Staff',
    userLimit: 15,
    features: ['All Business Starter features', 'AI Design Assistant', 'Advanced analytics (engagement, leads)', 'Priority email support', 'More templates'],
    extraStaffCost: 'R35',
    extraStaffUnit: '/month each',
    isBusiness: true,
    popular: true,
    description: "For growing SMEs or agencies requiring more cards and advanced features.",
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom Quote',
    priceMonthly: -1, 
    currencySymbol: 'R',
    frequency: '',
    staffIncluded: '20+ Staff',
    userLimit: Infinity, 
    features: ['Everything in Growth', 'Unlimited staff (volume pricing)', 'SSO (Single Sign-On)', 'API & integrations', 'Dedicated onboarding & training', 'Service Level Agreement', 'Dedicated account manager', 'Custom features on request'],
    isBusiness: true,
    description: "Tailored solutions for large organizations with specific needs and high volume usage.",
  },
];


export type AppCardTemplate = {
  id: string;
  name: string;
  description: string;
  profile: StaffCardData;
  design: CardDesignSettings;
  isPro?: boolean;
  stylePreview?: { backgroundColor?: string; waveColor?: string; backgroundGradient?: string; accentColor?: string; };
};

export const techInnovatorTemplate: AppCardTemplate = {
  id: 'tech-innovator',
  name: 'Tech Innovator',
  description: 'Sleek and modern, for the forward-thinking tech professional.',
  isPro: false,
  stylePreview: { backgroundColor: '#1A202C', accentColor: '#3B82F6' },
  profile: {
    name: 'Alex Turing',
    prefix: 'Dr.',
    suffix: 'PhD',
    preferredName: 'Alex',
    accreditations: 'Certified AI Specialist',
    title: 'AI Research Lead',
    companyName: 'Innovate AI',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0101',
    email: 'alex.turing@innovate.ai',
    website: 'innovate.ai/research',
    linkedin: 'linkedin.com/in/alexturingai',
    address: '1 Quantum Leap, Silicon Valley, CA',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Pioneering new frontiers in machine learning and ethical AI development. Seeking collaborators for impactful projects.',
    targetAudience: 'AI researchers, tech investors, potential engineering talent.',
    pronouns: 'they/them',
  },
  design: {
    template: 'tech-innovator',
    layout: 'image-left',
    colorScheme: { cardBackground: '#1A202C', textColor: '#E2E8F0', primaryColor: '#3B82F6' },
    qrCodeUrl: '',
    aiHint: "tech abstract",
  },
};

export const legalEagleTemplate: AppCardTemplate = {
  id: 'legal-eagle',
  name: 'Legal Eagle',
  description: 'Traditional and trustworthy, for legal professionals.',
  isPro: true,
  stylePreview: { backgroundColor: '#FFFFFF', accentColor: '#0A2342' },
  profile: {
    name: 'Samantha Specter',
    prefix: '',
    suffix: 'Esq.',
    preferredName: 'Sam',
    accreditations: 'Bar Association Member',
    title: 'Senior Partner',
    companyName: 'Specter & Ross Legal Group',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0202',
    email: 's.specter@specterross.com',
    website: 'specterrosslegal.com',
    linkedin: 'linkedin.com/in/samanthaspecter',
    address: 'Suite 500, Liberty Tower, New York, NY',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Over 20 years of experience in corporate litigation and M&A. Dedicated to achieving optimal outcomes for my clients.',
    targetAudience: 'Corporate clients, legal peers, potential high-value cases.',
    pronouns: 'she/her',
  },
  design: {
    template: 'legal-eagle',
    layout: 'image-right',
    colorScheme: { cardBackground: '#FFFFFF', textColor: '#2D3748', primaryColor: '#0A2342' },
    qrCodeUrl: '',
    aiHint: "legal professional",
  },
};

export const healingHandsTemplate: AppCardTemplate = {
  id: 'healing-hands',
  name: 'Healing Hands',
  description: 'Calm and professional, for healthcare providers.',
  isPro: true,
  stylePreview: { backgroundColor: '#F0F9FF', accentColor: '#10B981' },
  profile: {
    name: 'Elena Rodriguez',
    prefix: 'Dr.',
    title: 'Cardiologist',
    companyName: 'City General Hospital',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0303',
    email: 'e.rodriguez@citygeneral.org',
    website: 'citygeneral.org/cardiology',
    linkedin: 'linkedin.com/in/drelenarodriguez',
    address: '123 Health Way, Medicity, TX',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Board-certified cardiologist specializing in preventative care and cardiac rehabilitation. Committed to patient wellness.',
    targetAudience: 'Patients, referring physicians, medical colleagues.',
    pronouns: 'she/her',
  },
  design: {
    template: 'healing-hands',
    layout: 'image-left',
    colorScheme: { cardBackground: '#F0F9FF', textColor: '#1E40AF', primaryColor: '#10B981' },
    qrCodeUrl: '',
    aiHint: "medical healthcare",
  },
};

export const creativeSparkTemplate: AppCardTemplate = {
  id: 'creative-spark',
  name: 'Creative Spark',
  description: 'Bold and artistic, for designers, artists, and photographers.',
  isPro: true,
  stylePreview: { backgroundColor: '#4A5568', accentColor: '#DD6B20' },
  profile: {
    name: 'Leo Maxwell',
    title: 'Graphic Designer & Illustrator',
    companyName: 'Studio Max',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0404',
    email: 'leo@studiomax.design',
    website: 'studiomax.design',
    linkedin: 'linkedin.com/in/leomaxwelldesign',
    address: 'The Art Factory, Brooklyn, NY',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Transforming ideas into visual stories. Specializing in branding, illustration, and web design. Let\'s create something amazing!',
    targetAudience: 'Clients seeking design services, art directors, collaborators.',
    pronouns: 'he/him',
  },
  design: {
    template: 'creative-spark',
    layout: 'image-top',
    colorScheme: { cardBackground: '#4A5568', textColor: '#F7FAFC', primaryColor: '#DD6B20' },
    qrCodeUrl: '',
    aiHint: "creative artistic",
  },
};

export const solidFoundationTemplate: AppCardTemplate = {
  id: 'solid-foundation',
  name: 'Solid Foundation',
  description: 'Strong and reliable, for construction and trades.',
  isPro: true,
  stylePreview: { backgroundColor: '#E2E8F0', accentColor: '#975A16' },
  profile: {
    name: 'Mike Hammer',
    title: 'General Contractor',
    companyName: 'Hammer & Stone Builders',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0505',
    email: 'mike@hammerstone.build',
    website: 'hammerstone.build',
    linkedin: 'linkedin.com/company/hammerstonebuilders',
    address: '456 Builder Rd, Concreton, CA',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Building dreams from the ground up. Quality craftsmanship and reliable project management for residential and commercial projects.',
    targetAudience: 'Homeowners, property developers, architects.',
  },
  design: {
    template: 'solid-foundation',
    layout: 'image-right',
    colorScheme: { cardBackground: '#E2E8F0', textColor: '#2D3748', primaryColor: '#975A16' },
    qrCodeUrl: '',
    aiHint: "construction build",
  },
};


export const dreamWeaverTemplate: AppCardTemplate = {
  id: 'dream-weaver',
  name: 'Dream Weaver',
  description: 'Polished and approachable, for real estate agents.',
  isPro: true,
  stylePreview: { backgroundColor: '#FFFFFF', accentColor: '#2F855A' },
  profile: {
    name: 'Sarah Keys',
    title: 'Realtor',
    companyName: 'Homestead Properties',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0606',
    email: 'sarah.keys@homestead.com',
    website: 'sarahkeyshomes.com',
    linkedin: 'linkedin.com/in/sarahkeysrealtor',
    address: '789 Realty Ave, Suburbia, FL',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Your trusted partner in finding the perfect home. Local market expert with a passion for helping families achieve their dreams.',
    targetAudience: 'Home buyers, sellers, property investors.',
    pronouns: 'she/her',
  },
  design: {
    template: 'dream-weaver',
    layout: 'image-left',
    colorScheme: { cardBackground: '#FFFFFF', textColor: '#4A5568', primaryColor: '#2F855A' },
    qrCodeUrl: '',
    aiHint: "real estate home",
  },
};

export const welcomeHostTemplate: AppCardTemplate = {
  id: 'welcome-host',
  name: 'Welcome Host',
  description: 'Inviting and professional, for hospitality roles.',
  isPro: true,
  stylePreview: { backgroundColor: '#FFFBEB', accentColor: '#C05621' },
  profile: {
    name: 'David Lee',
    title: 'Hotel Manager',
    companyName: 'The Grand Resort & Spa',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0707',
    email: 'd.lee@grandresort.com',
    website: 'grandresort.com',
    linkedin: 'linkedin.com/in/davidleehospitality',
    address: '1 Paradise Ln, Resort City, CA',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Ensuring every guest has an unforgettable experience. Dedicated to excellence in service and hospitality management.',
    targetAudience: 'Hotel guests, event planners, corporate clients.',
  },
  design: {
    template: 'welcome-host',
    layout: 'image-top',
    colorScheme: { cardBackground: '#FFFBEB', textColor: '#7B341E', primaryColor: '#C05621' },
    qrCodeUrl: '',
    aiHint: "hospitality welcome",
  },
};

export const knowledgeBuilderTemplate: AppCardTemplate = {
  id: 'knowledge-builder',
  name: 'Knowledge Builder',
  description: 'Clear and authoritative, for educators and academics.',
  isPro: true,
  stylePreview: { backgroundColor: '#F7FAFC', accentColor: '#4299E1' },
  profile: {
    name: 'Anya Sharma',
    prefix: 'Dr.',
    suffix: 'PhD',
    title: 'Professor of Astrophysics',
    companyName: 'University of Science',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0808',
    email: 'asharma@university.edu',
    website: 'university.edu/asharma',
    linkedin: 'linkedin.com/in/dranyasharma',
    address: 'Dept. of Physics, 1 Scholar Way, Academia, MA',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Astrophysicist researching dark matter and galaxy formation. Passionate about teaching and science communication.',
    targetAudience: 'Students, academic peers, research institutions, science enthusiasts.',
    pronouns: 'she/her',
  },
  design: {
    template: 'knowledge-builder',
    layout: 'image-left',
    colorScheme: { cardBackground: '#F7FAFC', textColor: '#2D3748', primaryColor: '#4299E1' },
    qrCodeUrl: '',
    aiHint: "education academic",
  },
};

export const financialAdvisorTemplate: AppCardTemplate = {
  id: 'financial-advisor',
  name: 'Financial Advisor',
  description: 'Professional and trustworthy, for finance experts.',
  isPro: true,
  stylePreview: { backgroundColor: '#0A2342', accentColor: '#D69E2E' },
  profile: {
    name: 'Mark Sterling',
    title: 'Certified Financial Planner',
    companyName: 'Sterling Wealth Management',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-0909',
    email: 'mark.sterling@sterlingwealth.com',
    website: 'sterlingwealth.com',
    linkedin: 'linkedin.com/in/marksterlingcfp',
    address: 'Suite 101, Finance Plaza, Wall Street, NY',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Helping individuals and families achieve their financial goals through personalized planning and investment strategies.',
    targetAudience: 'Potential clients, investors, financial partners.',
    accreditations: 'CFP®',
  },
  design: {
    template: 'financial-advisor',
    layout: 'image-right',
    colorScheme: { cardBackground: '#0A2342', textColor: '#EBF8FF', primaryColor: '#D69E2E' },
    qrCodeUrl: '',
    aiHint: "finance professional",
  },
};

export const wellnessGuruTemplate: AppCardTemplate = {
  id: 'wellness-guru',
  name: 'Wellness Guru',
  description: 'Calm and holistic, for wellness practitioners.',
  isPro: true,
  stylePreview: { backgroundColor: '#F0FFF4', accentColor: '#9AE6B4' },
  profile: {
    name: 'Chandra Devi',
    title: 'Yoga Instructor & Holistic Coach',
    companyName: 'Serene Living Wellness',
    companyLogoUrl: `https://placehold.co/100x40.png`,
    phone: '+1 555-1010',
    email: 'chandra@sereneliving.com',
    website: 'sereneliving.com',
    linkedin: 'linkedin.com/in/chandradeviwellness',
    address: 'The Zen Den, 1 Peaceful Path, Harmony, CA',
    profilePictureUrl: `https://placehold.co/120x120.png`,
    cardBackgroundUrl: `https://placehold.co/600x900.png`,
    userInfo: 'Guiding you on your journey to balance and well-being through yoga, meditation, and mindful living practices.',
    targetAudience: 'Individuals seeking wellness services, yoga students, holistic health community.',
    pronouns: 'she/her',
    accreditations: 'RYT 500',
  },
  design: {
    template: 'wellness-guru',
    layout: 'image-top',
    colorScheme: { cardBackground: '#F0FFF4', textColor: '#2F855A', primaryColor: '#9AE6B4' },
    qrCodeUrl: '',
    aiHint: "wellness nature",
  },
};

export const APP_TEMPLATES: AppCardTemplate[] = [
  techInnovatorTemplate,
  legalEagleTemplate,
  healingHandsTemplate,
  creativeSparkTemplate,
  solidFoundationTemplate,
  dreamWeaverTemplate,
  welcomeHostTemplate,
  knowledgeBuilderTemplate,
  financialAdvisorTemplate,
  wellnessGuruTemplate,
];
