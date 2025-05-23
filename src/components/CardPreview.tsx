
"use client";

import React from 'react';
import type { StaffCardData, CardDesignSettings } from '@/lib/app-types';
import NextImage from 'next/image';
import { Phone, Mail, Globe, Linkedin, MapPin, UserCircle2, Building, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


interface CardPreviewProps {
  profile: StaffCardData;
  design: CardDesignSettings;
  isPublicView?: boolean;
  onSaveContact?: () => void;
}

const ensureHttps = (url: string | undefined): string => {
  if (!url) return "";
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.includes('.') && !url.includes(' ') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
    return `https://${url}`;
  }
  return url;
};


function CardPreviewComponent({ profile, design, isPublicView = false, onSaveContact }: CardPreviewProps) {
  const cardBaseStyle = {
    backgroundColor: profile.cardBackgroundUrl && !profile.cardBackgroundUrl.startsWith('https://placehold.co') && !profile.cardBackgroundUrl.startsWith('data:') ? 'transparent' : design.colorScheme.cardBackground,
    color: design.colorScheme.textColor,
    borderColor: design.colorScheme.primaryColor,
  };

  const textPrimaryColorStyle = { color: design.colorScheme.primaryColor };

  const isLikelyDarkBg = () => {
    const bgColor = design.colorScheme.cardBackground.toLowerCase();
    if (bgColor.startsWith('#')) {
      const r = parseInt(bgColor.substring(1, 3), 16);
      const g = parseInt(bgColor.substring(3, 5), 16);
      const b = parseInt(bgColor.substring(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    }
    return false;
  };

  const defaultTextColor = isLikelyDarkBg() ? '#FFFFFF' : '#333333';
  const textColorToUse = (profile.cardBackgroundUrl && !profile.cardBackgroundUrl.startsWith('https://placehold.co') && !profile.cardBackgroundUrl.startsWith('data:'))
    ? design.colorScheme.textColor
    : defaultTextColor;

  const textColorStyle = { color: textColorToUse };
  const textShadow = (profile.cardBackgroundUrl && !profile.cardBackgroundUrl.startsWith('https://placehold.co') && !profile.cardBackgroundUrl.startsWith('data:')) ? { textShadow: '0px 1px 3px rgba(0,0,0,0.6)' } : {};
  const combinedTextStyles = {...textColorStyle, ...textShadow};

  const iconSmallSize = "h-4 w-4 sm:h-5 sm:w-5";
  const profileImageSizeClass = design.layout === 'image-top' ? "w-24 h-24 sm:w-28 sm:h-28" : "w-20 h-20 sm:w-24 sm:w-24";
  const profilePlaceholderIconSize = design.layout === 'image-top' ? "h-16 w-16" : "h-12 w-12";

  const cardClasses = cn(
    "w-full p-4 sm:p-6 rounded-lg border-2 relative overflow-hidden",
    "flex flex-col justify-between z-10",
    "transform transition-all duration-300",
    isPublicView
      ? "h-full" 
      : "aspect-[9/16] max-h-[750px] hover:scale-[1.02] shadow-2xl" 
  );

  const showBackgroundImage = profile.cardBackgroundUrl && 
                              (profile.cardBackgroundUrl.startsWith('data:') || profile.cardBackgroundUrl.startsWith('http'));


  const cardContent = (
    <div className="relative w-full h-full pt-2 sm:pt-3"> {/* Added padding to the main content wrapper */}
      {showBackgroundImage ? (
        <NextImage
          src={profile.cardBackgroundUrl!} 
          alt={profile.name ? `${profile.name}'s card background` : "Card background"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center z-0"
          data-ai-hint={design.aiHint || "abstract background"}
          priority={isPublicView}
        />
      ) : null}
      
      <div
        className={cn(
          "relative z-10", 
          "flex flex-col justify-between h-full" 
        )}
        style={{...cardBaseStyle, backgroundColor: showBackgroundImage ? 'transparent' : cardBaseStyle.backgroundColor}}
      >
        <div className={cn(
          "flex-shrink-0",
          design.layout === 'image-top' ? 'flex flex-col items-center text-center mb-3 sm:mb-4' : 'flex flex-row items-center gap-3 sm:gap-4 mb-2 sm:mb-3', // Added bottom margin
        )}>
          <div className={cn(
            "flex-shrink-0",
            design.layout === 'image-top' ? 'mb-2 sm:mb-3' : '',
            design.layout === 'image-left' ? 'order-1' : '',
            design.layout === 'image-right' ? 'order-2' : ''
          )}>
            {profile.profilePictureUrl && !profile.profilePictureUrl.startsWith('https://placehold.co') ? (
              <NextImage
                src={profile.profilePictureUrl}
                alt={profile.name || "Profile picture"}
                width={design.layout === 'image-top' ? 96 : 80}
                height={design.layout === 'image-top' ? 96 : 80}
                className={cn("rounded-full object-cover border-2", profileImageSizeClass)}
                style={{ borderColor: design.colorScheme.primaryColor }}
                data-ai-hint={profile.profilePictureUrl?.includes('placehold.co') ? "person avatar" : undefined}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/${design.layout === 'image-top' ? 96 : 80}x${design.layout === 'image-top' ? 96 : 80}.png`;
                  target.srcset = "";
                }}
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
            {profile.companyLogoUrl && !profile.companyLogoUrl.startsWith('https://placehold.co') && (
                <div className={cn(
                    "mb-1 sm:mb-2",
                    design.layout === 'image-top' ? 'mx-auto' : '',
                    design.layout === 'image-right' ? 'ml-auto' : ''
                )}>
                    <NextImage 
                        src={profile.companyLogoUrl} 
                        alt={profile.companyName || "Company Logo"} 
                        width={80} 
                        height={30}
                        className="object-contain"
                        data-ai-hint={profile.companyLogoUrl?.includes('placehold.co') ? "company logo" : undefined}
                    />
                </div>
            )}
            <h2 className={cn("text-xl sm:text-2xl font-bold truncate overflow-hidden")} style={{...textPrimaryColorStyle, ...textShadow}}>
              {profile.name || "Staff Name"}
            </h2>
            {profile.title && <p className={cn("text-md sm:text-lg truncate overflow-hidden")} style={combinedTextStyles}>{profile.title}</p>}
            {profile.companyName && <p className={cn("text-sm sm:text-md truncate overflow-hidden")} style={combinedTextStyles}><Building className="inline h-3 w-3 mr-1" style={textColorStyle} />{profile.companyName}</p>}
          </div>
        </div>

        <div className={cn(
            "my-2 sm:my-3 space-y-2 sm:space-y-2.5 overflow-y-auto px-1 flex-grow", // Increased spacing
            design.layout === 'image-right' ? 'items-end flex flex-col' : design.layout === 'image-left' ? 'items-start flex flex-col' : 'items-center flex flex-col text-center'
          )}>
          {[
            { key: 'email', icon: Mail, value: profile.email, hrefPrefix: 'mailto:' },
            { key: 'phone', icon: Phone, value: profile.phone, hrefPrefix: 'tel:' },
            { key: 'website', icon: Globe, value: profile.website, hrefPrefix: '' },
            { key: 'linkedin', icon: Linkedin, value: profile.linkedin, hrefPrefix: '' },
            { key: 'address', icon: MapPin, value: profile.address },
          ].map((item) => {
            if (item.value && item.value.trim() !== '') { 
            const IconComponent = item.icon;
            const displayValue = item.value; // No transformValue needed now
            const hrefValue = item.hrefPrefix !== undefined ? ensureHttps(item.hrefPrefix + displayValue) : undefined;
            
            return (
              <div key={item.key} className="flex items-center gap-2">
                <IconComponent className={cn(iconSmallSize)} style={textPrimaryColorStyle} />
                {hrefValue ? (
                  <a href={hrefValue} target="_blank" rel="noopener noreferrer" className={cn("hover:underline break-all text-xs sm:text-sm")} style={combinedTextStyles}>
                    {item.value}
                  </a>
                ) : (
                  <span className={cn("text-xs sm:text-sm break-all")} style={combinedTextStyles}>
                    {item.value}
                  </span>
                )}
              </div>
            );
          }
          return null;
          })}

          {profile.userInfo && ( 
            <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t w-full max-h-20 sm:max-h-24 overflow-y-auto" style={{borderColor: design.colorScheme.primaryColor + '50'}}>
              <h3 className="font-semibold text-sm mb-1 sticky top-0 bg-transparent" style={{...textPrimaryColorStyle, ...textShadow}}>About { isPublicView ? (profile.name?.split(' ')[0] || "Staff") : "Staff"}</h3>
              <p className={cn("text-xs whitespace-pre-wrap break-words")} style={combinedTextStyles}>{profile.userInfo}</p>
            </div>
          )}
        </div>

        {isPublicView && onSaveContact && (
          <div className="flex-shrink-0 mt-auto pt-3 sm:pt-4">
            <Button
              onClick={onSaveContact}
              className="w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors"
              style={{backgroundColor: design.colorScheme.primaryColor, color: design.colorScheme.cardBackground }}
            >
              <Download className="mr-2 h-4 w-4" />
              Save Contact
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (isPublicView) {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className={cardClasses} style={cardBaseStyle}>
              {cardContent}
            </div>
        </div>
    );
  }

  // Editor preview
  return (
    <div className={cn("shadow-xl w-full overflow-hidden sticky top-6")}>
      <div className="text-2xl text-center p-4 font-semibold">Card Editor Preview</div>
      <div className={cn("flex flex-col items-center justify-center p-4")}>
        <div className={cardClasses} style={cardBaseStyle}>
          {cardContent}
        </div>
      </div>
    </div>
  );
}

export const CardPreview = React.memo(CardPreviewComponent);
