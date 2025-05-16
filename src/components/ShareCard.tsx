
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import { ShareOptions } from './ShareOptions';

interface ShareCardProps {
  cardUrl: string;
}

export function ShareCard({ cardUrl }: ShareCardProps) {
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
