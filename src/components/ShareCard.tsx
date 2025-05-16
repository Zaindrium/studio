
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Mail as MailIcon, MessageSquare } from 'lucide-react';

interface ShareCardProps {
  cardUrl: string;
}

export function ShareCard({ cardUrl }: ShareCardProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cardUrl).then(() => {
        toast({ title: 'Copied!', description: 'Card URL copied to clipboard.' });
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Share2 className="mr-2 h-6 w-6 text-primary" />Share Your Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="cardUrlInput" className="block text-sm font-medium text-foreground mb-1">Your Card URL</label>
          <div className="flex space-x-2">
            <Input id="cardUrlInput" type="text" value={cardUrl} readOnly className="flex-grow bg-muted/50" />
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
      </CardContent>
    </Card>
  );
}
