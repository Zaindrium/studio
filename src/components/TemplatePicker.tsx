
"use client";

import type { AppTemplate } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

interface TemplatePickerProps {
  templates: AppTemplate[];
  currentTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplatePicker({ templates, currentTemplateId, onTemplateSelect }: TemplatePickerProps) {
  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <LayoutDashboard className="mr-2 h-6 w-6 text-primary" />
          Choose a Starting Template
        </CardTitle>
        <CardDescription>
          Select a template to quickly set up your digital business card. You can customize everything later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={currentTemplateId} onValueChange={onTemplateSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} - <span className="text-sm text-muted-foreground ml-1">{template.description}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
