
"use client";

import React, { useState, useEffect, memo } from 'react'; // Added memo
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail as MailIcon, MessageSquare, Share2 as ShareIcon } from 'lucide-react';

interface ShareOptionsProps {
  cardUrl: string;
}

const ShareOptionsComponent = ({ cardUrl }: ShareOptionsProps) => {
  const { toast } = useToast();
  const [isWebShareSupported, setIsWebShareSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      setIsWebShareSupported(true);
    }
  }, []);

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cardUrl).then(() => {
        toast({ 
          title: 'Copied!', 
          description: 'Card URL copied! You can paste it in emails, messaging apps, or anywhere else.' 
        });
      }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({ title: 'Error', description: 'Failed to copy URL.', variant: 'destructive' });
      });
    } else {
       toast({ title: 'Error', description: 'Clipboard API not available.', variant: 'destructive' });
    }
  };

  const shareViaEmail = () => {
    if (typeof window !== "undefined") {
      toast({ 
        title: 'Opening Email Client', 
        description: 'Attempting to share your card URL via email.' 
      });
      window.location.href = `mailto:?subject=Check out my digital business card&body=Hi,%0D%0A%0D%0AHere's my digital business card: ${encodeURIComponent(cardUrl)}`;
    } else {
      toast({ title: 'Error', description: 'Cannot open email client outside of a browser environment.', variant: 'destructive' });
    }
  };
  
  const shareViaSMS = () => {
     if (typeof window !== "undefined") {
      toast({ 
        title: 'Opening SMS App', 
        description: 'Attempting to share your card URL via SMS.' 
      });
      window.location.href = `sms:?body=Check out my digital business card: ${encodeURIComponent(cardUrl)}`;
    } else {
      toast({ title: 'Error', description: 'Cannot open SMS app outside of a browser environment.', variant: 'destructive' });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Digital Business Card',
          text: 'Check out my digital business card:',
          url: cardUrl,
        });
        toast({
          title: 'Shared!',
          description: 'Your card has been shared.',
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Share cancelled by user.');
        } else {
          console.error('Error sharing natively:', error);
          toast({
            title: 'Share Error',
            description: 'Could not share your card using the native share. Please try another method.',
            variant: 'destructive',
          });
        }
      }
    } else {
      toast({
        title: 'Not Supported',
        description: 'Native sharing is not supported on this browser. Try copying the link.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {isWebShareSupported && (
        <Button onClick={handleNativeShare} className="w-full">
          <ShareIcon className="mr-2 h-4 w-4" /> Share via App...
        </Button>
      )}
      <div>
        <label htmlFor="shareOptionsCardUrlInput" className="block text-sm font-medium text-foreground mb-1">Your Card URL</label>
        <div className="flex space-x-2">
          <Input id="shareOptionsCardUrlInput" type="text" value={cardUrl} readOnly className="flex-grow bg-muted/50" />
          <Button onClick={copyToClipboard} variant="outline" size="icon" aria-label="Copy URL">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button onClick={shareViaEmail} variant="outline">
              <MailIcon className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button onClick={shareViaSMS} variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" /> SMS
          </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
          You can also share the QR code from the preview section.
      </p>
    </div>
  );
}

export const ShareOptions = memo(ShareOptionsComponent);
