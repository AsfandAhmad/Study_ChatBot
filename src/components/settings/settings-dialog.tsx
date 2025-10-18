'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  children: React.ReactNode;
}

export default function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  // Mock settings state. In a real app, this would come from a user context or API.
  const [settings, setSettings] = React.useState({
    theme: 'dark',
    notificationsEnabled: true,
    studyRemindersEnabled: false,
  });

  const handleSave = () => {
    // In a real app, you would save these settings to Firestore.
    console.log('Saving settings:', settings);
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label>Theme</Label>
            <RadioGroup
              value={settings.theme}
              onValueChange={(theme) => setSettings(s => ({...s, theme}))}
              className="flex gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Light
                </Label>
              </div>
               <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Dark
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive general app notifications.
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => setSettings(s => ({...s, notificationsEnabled: checked}))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="reminders-enabled" className="text-base">
                Study Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminders to stick to your study plan.
              </p>
            </div>
            <Switch
              id="reminders-enabled"
              checked={settings.studyRemindersEnabled}
              onCheckedChange={(checked) => setSettings(s => ({...s, studyRemindersEnabled: checked}))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
