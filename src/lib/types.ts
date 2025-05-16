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
  qrCodeUrl: string;
}

export const defaultUserProfile: UserProfile = {
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
  userInfo: 'A software engineer passionate about web development and open source.',
  targetAudience: 'Tech recruiters, potential clients, and collaborators in the software industry.',
};

export const defaultCardDesignSettings: CardDesignSettings = {
  template: 'modern',
  layout: 'image-left',
  colorScheme: {
    cardBackground: '#FFFFFF',
    textColor: '#333333',
    primaryColor: '#3F51B5', // Matches app primary
  },
  qrCodeUrl: typeof window !== 'undefined' ? `${window.location.origin}/card/jane-doe` : '/card/jane-doe', // Placeholder dynamic URL
};
