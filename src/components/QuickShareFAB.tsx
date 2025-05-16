
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Share2 as ShareIcon, X as XIcon, QrCode } from "lucide-react";
import NextImage from 'next/image';

interface QuickShareFABProps {
  cardUrl: string;
}

export function QuickShareFAB({ cardUrl }: QuickShareFABProps) {
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(cardUrl)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default" // Use default primary color
          size="icon"
          className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90"
          aria-label="Quick Share Card"
        >
          <QrCode className="h-6 w-6 text-primary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs w-[90vw] p-4">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center text-xl text-center justify-center">
            <QrCode className="mr-2 h-5 w-5 text-primary" />
            Scan QR Code to Share
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            Share this QR code or your card URL: <a href={cardUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{cardUrl}</a>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center p-4 rounded-md bg-card">
          {cardUrl ? (
            <NextImage
              src={qrCodeApiUrl}
              alt="Card QR Code"
              width={256}
              height={256}
              className="rounded-md"
              unoptimized // Recommended for QR server if not whitelisted perfectly
            />
          ) : (
            <p>Generating QR Code...</p>
          )}
        </div>
         <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2">
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
