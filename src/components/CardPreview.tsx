
"use client";

import React from 'react';
import type { UserProfile, CardDesignSettings } from '@/lib/types';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Globe, Linkedin, Twitter, Github, MapPin, UserCircle2, Briefcase, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


interface CardPreviewProps {
  profile: UserProfile;
  design: CardDesignSettings;
  isPublicView?: boolean; 
  onSaveContact?: () => void; 
}

const ensureHttps = (url: string) => {
  if (!url) return "";
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.includes('.') && !url.includes(' ')) { 
      return `https://${url}`;
  }
  return url; 
};


function CardPreviewComponent({ profile, design, isPublicView = false, onSaveContact }: CardPreviewProps) {
  const cardBaseStyle = {
    backgroundColor: profile.cardBackgroundUrl ? 'transparent' : design.colorScheme.cardBackground,
    color: design.colorScheme.textColor,
    borderColor: design.colorScheme.primaryColor,
  };

  const cardBackgroundImageStyle = profile.cardBackgroundUrl ? {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${profile.cardBackgroundUrl})`, // Subtle overlay
  } : {};

  const textPrimaryColorStyle = { color: design.colorScheme.primaryColor };
  
  // Dynamic text color for readability based on card background (simple check)
  // More sophisticated checks might involve analyzing image brightness or providing user choice
  const isDarkBackground = design.colorScheme.cardBackground.toLowerCase() === '#0a2342' || design.colorScheme.cardBackground.toLowerCase() === '#000000';
  const defaultTextColor = isDarkBackground ? '#FFFFFF' : '#333333';
  const textColorStyle = { 
    color: profile.cardBackgroundUrl ? design.colorScheme.textColor : defaultTextColor // Use specified text color if bg image, else default
  };
  
  // Apply text shadow if background image exists for better readability
  const textShadow = profile.cardBackgroundUrl ? { textShadow: '0px 1px 2px rgba(0,0,0,0.5)' } : {};
  const combinedTextStyles = {...textColorStyle, ...textShadow};


  const iconSmallSize = "h-4 w-4 sm:h-5 sm:w-5"; 
  const profileImageSizeClass = design.layout === 'image-top' ? "w-24 h-24 sm:w-28 sm:h-28" : "w-20 h-20 sm:w-24 sm:w-24";
  const profilePlaceholderIconSize = design.layout === 'image-top' ? "h-16 w-16" : "h-12 w-12";


  return (
    <Card className={cn("shadow-xl w-full overflow-hidden", isPublicView ? "max-w-sm mx-auto" : "sticky top-6")}>
      {!isPublicView && (
        <CardHeader>
          <CardTitle className="text-2xl text-center">Card Preview</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("flex flex-col items-center justify-center", isPublicView ? "p-0" : "p-4")}>
        <div
          className={cn(
            "w-full aspect-[9/16] max-h-[750px] p-4 sm:p-6 rounded-lg shadow-2xl border-2",
            "flex flex-col justify-between", 
            "bg-cover bg-center", 
            "transform transition-all duration-300",
            isPublicView ? "" : "hover:scale-[1.02]",
          )}
          style={{ ...cardBaseStyle, ...cardBackgroundImageStyle }}
        >
          {/* Top section for Profile Pic, Name, Title */}
          <div className={cn(
            "flex-shrink-0 pt-4", // Added padding top
            design.layout === 'image-top' ? 'flex flex-col items-center text-center' : 'flex flex-row items-center gap-3 sm:gap-4',
          )}>
            <div className={cn(
              "flex-shrink-0",
              design.layout === 'image-top' ? 'mb-2 sm:mb-3' : '',
              design.layout === 'image-left' ? 'order-1' : '',
              design.layout === 'image-right' ? 'order-2' : ''
            )}>
              {profile.profilePictureUrl ? (
                <NextImage
                  src={profile.profilePictureUrl}
                  alt={profile.name || "Profile picture"}
                  width={design.layout === 'image-top' ? 96 : 80} 
                  height={design.layout === 'image-top' ? 96 : 80}
                  className={cn("rounded-full object-cover border-2", profileImageSizeClass)}
                  style={{ borderColor: design.colorScheme.primaryColor }}
                  data-ai-hint="person portrait"
                  onError={(e) => (e.currentTarget.src = `https://placehold.co/${design.layout === 'image-top' ? 96 : 80}x${design.layout === 'image-top' ? 96 : 80}.png`)}
                />
              ) : (
                <div
                  className={cn(
                    "rounded-full bg-muted/70 flex items-center justify-center border-2",
                    profileImageSizeClass
                  )}
                  style={{ borderColor: design.colorScheme.primaryColor }}
                >
                  <UserCircle2 className={cn(profilePlaceholderIconSize, "text-muted-foreground")} />
                </div>
              )}
            </div>

            <div className={cn(
              "flex-grow",
              design.layout === 'image-top' ? 'text-center' : '',
              design.layout === 'image-left' ? 'order-2 text-left' : '',
              design.layout === 'image-right' ? 'order-1 text-right' : ''
            )}>
              <h2 className={cn("text-xl sm:text-2xl font-bold")} style={{...textPrimaryColorStyle, ...textShadow}}>
                {profile.name || "Your Name"}
              </h2>
              {profile.title && <p className={cn("text-md sm:text-lg")} style={combinedTextStyles}>{profile.title}</p>}
              {profile.company && <p className={cn("text-sm sm:text-md")} style={combinedTextStyles}><Briefcase className="inline h-3 w-3 mr-1" style={textColorStyle} />{profile.company}</p>}
            </div>
          </div>
          
          {/* Middle section for contact details */}
          <div className={cn(
              "my-2 sm:my-3 space-y-1.5 sm:space-y-2 overflow-y-auto px-1 flex-grow",
              design.layout === 'image-right' ? 'items-end flex flex-col' : 'items-start flex flex-col' // Default to left align for image-top and image-left
            )}>
            {profile.email && (
              <div className="flex items-center gap-2">
                <Mail className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                <span className={cn("text-xs sm:text-sm break-all")} style={combinedTextStyles}>{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                <span className={cn("text-xs sm:text-sm break-all")} style={combinedTextStyles}>{profile.phone}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2">
                <Globe className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                <a href={ensureHttps(profile.website)} target="_blank" rel="noopener noreferrer" className={cn("hover:underline break-all text-xs sm:text-sm")} style={combinedTextStyles}>{profile.website}</a>
              </div>
            )}
            {profile.linkedin && (
                <div className="flex items-center gap-2">
                <Linkedin className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                <a href={ensureHttps(profile.linkedin)} target="_blank" rel="noopener noreferrer" className={cn("hover:underline break-all text-xs sm:text-sm")} style={combinedTextStyles}>{profile.linkedin}</a>
              </div>
            )}
            {profile.twitter && (
              <div className="flex items-center gap-2">
                <Twitter className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                <a href={ensureHttps(profile.twitter.startsWith('@') ? `https://twitter.com/${profile.twitter.substring(1)}` : profile.twitter)} target="_blank" rel="noopener noreferrer" className={cn("hover:underline break-all text-xs sm:text-sm")} style={combinedTextStyles}>{profile.twitter}</a>
              </div>
            )}
            {profile.github && (
              <div className="flex items-center gap-2">
                <Github className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                <a href={ensureHttps(profile.github.includes('/') ? profile.github : `https://github.com/${profile.github}`)} target="_blank" rel="noopener noreferrer" className={cn("hover:underline break-all text-xs sm:text-sm")} style={combinedTextStyles}>{profile.github}</a>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-2">
                <MapPin className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                <span className={cn("text-xs sm:text-sm")} style={combinedTextStyles}>{profile.address}</span>
              </div>
            )}
            {isPublicView && profile.userInfo && (
              <div className="pt-2 mt-2 border-t" style={{borderColor: design.colorScheme.primaryColor + '50'}}>
                <h3 className="font-semibold text-sm mb-1" style={{...textPrimaryColorStyle, ...textShadow}}>About Me</h3>
                <p className={cn("text-xs")} style={combinedTextStyles}>{profile.userInfo}</p>
              </div>
            )}
          </div>

          {isPublicView && onSaveContact && (
             <div className="flex-shrink-0 mt-auto pt-3 sm:pt-4">
               <Button 
                onClick={onSaveContact}
                className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors"
                style={{backgroundColor: design.colorScheme.primaryColor, color: design.colorScheme.textColor /* Smart color for button text */}}
               >
                <Download className="mr-2 h-4 w-4" />
                Save Contact
               </Button>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const CardPreview = React.memo(CardPreviewComponent);

    