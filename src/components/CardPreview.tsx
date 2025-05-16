
"use client";

import React from 'react';
import type { UserProfile, CardDesignSettings } from '@/lib/types';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Globe, Linkedin, Twitter, Github, MapPin, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardPreviewProps {
  profile: UserProfile;
  design: CardDesignSettings;
}

const ensureHttps = (url: string) => {
  if (!url) return "";
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.includes('.') && !url.includes(' ')) { // Basic check for domain-like string
      return `https://${url}`;
  }
  return url; // Return as is if it doesn't look like a URL that needs https
};


function CardPreviewComponent({ profile, design }: CardPreviewProps) {
  const cardStyle = {
    backgroundColor: design.colorScheme.cardBackground,
    color: design.colorScheme.textColor,
    borderColor: design.colorScheme.primaryColor,
  };

  const textPrimaryColor = { color: design.colorScheme.primaryColor };
  const iconSize = "h-5 w-5";
  const profileIconSize = "h-16 w-16";

  const qrCodeImageUrl = design.qrCodeUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(design.qrCodeUrl)}`
    : `https://placehold.co/128x128.png`; // Fallback if qrCodeUrl is empty

  return (
    <Card className="shadow-xl sticky top-6">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Card Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-md p-6 rounded-lg shadow-2xl border-2",
            "transform transition-all duration-300 hover:scale-[1.02]",
             design.layout === 'image-top' ? 'flex flex-col items-center' : 'flex flex-row items-start gap-4 md:gap-6'
          )}
          style={cardStyle}
        >
          <div className={cn(
            "flex-shrink-0",
            design.layout === 'image-top' ? 'mb-4' : '',
            design.layout === 'image-left' ? 'order-1' : '',
            design.layout === 'image-right' ? 'order-2' : ''
          )}>
            {profile.profilePictureUrl ? (
              <NextImage
                src={profile.profilePictureUrl}
                alt={profile.name || "Profile picture"}
                width={100}
                height={100}
                className="rounded-full object-cover border-2"
                style={{ borderColor: design.colorScheme.primaryColor }}
                data-ai-hint="person portrait"
                onError={(e) => (e.currentTarget.src = `https://placehold.co/100x100.png`)}
              />
            ) : (
              <div 
                className="w-[100px] h-[100px] rounded-full bg-muted flex items-center justify-center border-2"
                style={{ borderColor: design.colorScheme.primaryColor }}
              >
                <UserCircle2 className={cn(profileIconSize, "text-muted-foreground")} />
              </div>
            )}
          </div>

          <div className={cn(
            "flex-grow",
            design.layout === 'image-top' ? 'text-center' : '',
            design.layout === 'image-left' ? 'order-2 text-left' : '',
            design.layout === 'image-right' ? 'order-1 text-right' : ''
          )}>
            <h2 className="text-2xl font-bold" style={textPrimaryColor}>{profile.name || "Your Name"}</h2>
            <p className="text-lg">{profile.title || "Your Title"}</p>
            {profile.company && <p className="text-md ">{profile.company}</p>}
            
            <div className={cn(
                "mt-4 space-y-2",
                design.layout === 'image-right' ? 'items-end flex flex-col' : ''
            )}>
              {profile.email && (
                <div className="flex items-center gap-2">
                  <Mail className={cn(iconSize)} style={textPrimaryColor} />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className={cn(iconSize)} style={textPrimaryColor} />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <Globe className={cn(iconSize)} style={textPrimaryColor} />
                  <a href={ensureHttps(profile.website)} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">{profile.website}</a>
                </div>
              )}
              {profile.linkedin && (
                 <div className="flex items-center gap-2">
                  <Linkedin className={cn(iconSize)} style={textPrimaryColor} />
                  <a href={ensureHttps(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">{profile.linkedin}</a>
                </div>
              )}
              {profile.twitter && (
                <div className="flex items-center gap-2">
                  <Twitter className={cn(iconSize)} style={textPrimaryColor} />
                  <a href={ensureHttps(profile.twitter.startsWith('@') ? `https://twitter.com/${profile.twitter.substring(1)}` : profile.twitter)} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">{profile.twitter}</a>
                </div>
              )}
              {profile.github && (
                <div className="flex items-center gap-2">
                  <Github className={cn(iconSize)} style={textPrimaryColor} />
                  <a href={ensureHttps(profile.github.includes('/') ? profile.github : `https://github.com/${profile.github}`)} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">{profile.github}</a>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-2">
                  <MapPin className={cn(iconSize)} style={textPrimaryColor} />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 border rounded-lg bg-secondary/50 w-full max-w-md flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2" style={{color: design.colorScheme.primaryColor}}>Your QR Code</h3>
            <div className="p-2 bg-white rounded-md inline-block shadow">
                 <NextImage
                    src={qrCodeImageUrl}
                    alt={`QR Code for ${profile.name || 'card'}`}
                    width={128}
                    height={128}
                    data-ai-hint="qr code"
                  />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center break-all">Links to: {design.qrCodeUrl}</p>
        </div>

      </CardContent>
    </Card>
  );
}

export const CardPreview = React.memo(CardPreviewComponent);
