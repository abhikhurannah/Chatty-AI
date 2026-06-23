import { useState } from "react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
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
import {
  Moon, Sun, Settings as SettingsIcon, Palette, Check,
  Sparkles, Cloud, Star, Heart, Zap, Flame, Coffee
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useThemeStore, type AppTheme } from "@/stores/useThemeStore";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickThemes: { name: AppTheme; label: string; icon: React.ElementType; gradient: string }[] = [
  { name: "default",  label: "Default",   icon: Sparkles, gradient: "from-violet-600 to-blue-600" },
  { name: "midnight", label: "Midnight",  icon: Moon,     gradient: "from-indigo-800 to-purple-900" },
  { name: "ocean",    label: "Ocean",     icon: Cloud,    gradient: "from-cyan-600 to-blue-700" },
  { name: "forest",   label: "Forest",    icon: Star,     gradient: "from-green-800 to-emerald-900" },
  { name: "sunset",   label: "Sunset",    icon: Sun,      gradient: "from-orange-500 to-pink-600" },
  { name: "candy",    label: "Candy",     icon: Heart,    gradient: "from-pink-500 to-rose-500" },
  { name: "neon",     label: "Neon",      icon: Zap,      gradient: "from-purple-600 to-pink-600" },
  { name: "autumn",   label: "Autumn",    icon: Flame,    gradient: "from-amber-600 to-red-700" },
  { name: "mocha",    label: "Mocha",     icon: Coffee,   gradient: "from-amber-900 to-stone-800" },
];

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { theme, setTheme } = useTheme();
  const { appTheme, setAppTheme } = useThemeStore();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>Customize your chat experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Light / Dark toggle (next-themes) */}
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

          {/* Color Theme Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Color Theme
              </Label>
              <Link to="/themes" onClick={() => onOpenChange(false)}>
                <Button variant="ghost" size="sm" className="text-xs text-primary h-auto py-1">
                  View all →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickThemes.map((t) => {
                const Icon = t.icon;
                const isActive = appTheme === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setAppTheme(t.name)}
                    className={`relative rounded-xl overflow-hidden h-16 bg-gradient-to-br ${t.gradient} flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 ${
                      isActive ? "ring-2 ring-offset-2 ring-primary ring-offset-background" : ""
                    }`}
                  >
                    <Icon size={16} className="text-white" />
                    <span className="text-white text-[10px] font-semibold">{t.label}</span>
                    {isActive && (
                      <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                        <Check size={8} className="text-green-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Preferences */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Preferences</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                    Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Get notified for new messages</p>
                </div>
                <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="sound" className="text-sm font-medium cursor-pointer">
                    Sound Effects
                  </Label>
                  <p className="text-xs text-muted-foreground">Play sounds for messages</p>
                </div>
                <Switch id="sound" checked={soundEffects} onCheckedChange={setSoundEffects} />
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
