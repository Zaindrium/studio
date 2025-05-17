
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import { ShareOptions } from './ShareOptions';
import React, { memo } from 'react'; // Added memo

interface ShareCardProps {
  cardUrl: string;
}

const ShareCardComponent = ({ cardUrl }: ShareCardProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Share2 className="mr-2 h-6 w-6 text-primary" />Share Your Card</CardTitle>
      </CardHeader>
      <CardContent>
        <ShareOptions cardUrl={cardUrl} />
      </CardContent>
    </Card>
  );
}

export const ShareCard = memo(ShareCardComponent);
