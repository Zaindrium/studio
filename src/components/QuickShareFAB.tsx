
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2 as ShareIcon } from "lucide-react";
import { ShareOptions } from "./ShareOptions";

interface QuickShareFABProps {
  cardUrl: string;
}

export function QuickShareFAB({ cardUrl }: QuickShareFABProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-xl"
          aria-label="Quick Share Card"
        >
          <ShareIcon className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <ShareIcon className="mr-2 h-5 w-5 text-primary" />
            Share Your Digital Card
          </DialogTitle>
          <DialogDescription>
            Easily share your card via URL, email, or SMS.
          </DialogDescription>
        </DialogHeader>
        <ShareOptions cardUrl={cardUrl} />
      </DialogContent>
    </Dialog>
  );
}
