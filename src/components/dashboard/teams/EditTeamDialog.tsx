
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DetailedTeam, StaffRecord } from '@/lib/app-types';
import { useToast } from '@/hooks/use-toast';

interface EditTeamFormState {
  name: string;
  description: string;
  managerId: string | null; // Can be null if no manager
}

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: DetailedTeam | null;
  staffList: StaffRecord[];
  onSave: (updatedData: EditTeamFormState) => Promise<void>;
  isLoadingStaff: boolean;
}

const EditTeamDialog: React.FC<EditTeamDialogProps> = ({
  open,
  onOpenChange,
  team,
  staffList,
  onSave,
  isLoadingStaff,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EditTeamFormState>({
    name: '',
    description: '',
    managerId: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
        managerId: team.managerId || 'no-manager', // Adapt to how your select expects no manager
      });
    } else {
      // Reset form if no team is provided (e.g. dialog closed and props cleared)
      setFormData({
        name: '',
        description: '',
        managerId: 'no-manager',
      });
    }
  }, [team, open]); // Re-initialize form when team or open state changes

  const handleInputChange = (field: keyof EditTeamFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name?.trim() || !formData.description?.trim()) {
      toast({
        title: "Missing Information",
        description: "Team Name and Description cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
      // onOpenChange(false); // Parent will handle closing on successful save
    } catch (error) {
      // Error toast should be handled by the parent onSave function if it throws
      console.error("EditTeamDialog: Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!team) return null; // Don't render if no team data, though open should prevent this

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Team: {team.name}</DialogTitle>
          <DialogDescription>
            Update the details for this team. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTeamName">Team Name</Label>
              <Input
                id="editTeamName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Marketing Team"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTeamDescription">Description</Label>
              <Input
                id="editTeamDescription"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Responsible for all marketing activities"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTeamManager">Manager (Optional)</Label>
              {isLoadingStaff ? (
                <p>Loading staff...</p> // Replace with Skeleton if available
              ) : (
                <Select
                  value={formData.managerId || 'no-manager'} // Ensure 'no-manager' or actual ID
                  onValueChange={(value) => handleInputChange('managerId', value)}
                >
                  <SelectTrigger id="editTeamManager">
                    <SelectValue placeholder="Select a manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-manager">No Manager (Assign Later)</SelectItem>
                    {staffList && staffList.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.name} ({staff.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {(!staffList || staffList.length === 0) && !isLoadingStaff && (
                <p className="text-xs text-muted-foreground">No staff available to assign as manager.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamDialog;
