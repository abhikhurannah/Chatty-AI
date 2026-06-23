import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Settings as SettingsIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your chat experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Appearance</Label>
            
            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-2 gap-3">
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-muted cursor-pointer transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <Sun className="h-6 w-6 mb-2 text-orange-500" />
                  <span className="text-sm font-medium">Light</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-muted cursor-pointer transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <Moon className="h-6 w-6 mb-2 text-blue-500" />
                  <span className="text-sm font-medium">Dark</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Preferences Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Preferences</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                    Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified for new messages
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="sound" className="text-sm font-medium cursor-pointer">
                    Sound Effects
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Play sounds for messages
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Chatty AI <span className="text-purple-500">v1.0.0</span>
            </p>
            <div className="flex justify-center gap-3 text-xs">
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                Privacy
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                Terms
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};