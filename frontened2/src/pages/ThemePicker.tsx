import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, Sun, Moon, Sparkles, Check, Eye,
  Zap, Star, Heart, Cloud, Coffee, Flame, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useThemeStore, type AppTheme } from "@/stores/useThemeStore";
import toast from "react-hot-toast";

const themes: {
  name: AppTheme;
  label: string;
  icon: React.ElementType;
  gradient: string;
  primary: string;
  secondary: string;
  description: string;
}[] = [
  { 
    name: "default", 
    label: "Default", 
    icon: Sparkles,
    gradient: "from-violet-700 via-purple-700 to-blue-700",
    primary: "#8B5CF6",
    secondary: "#3B82F6",
    description: "Original light/dark system theme"
  },
  { 
    name: "midnight", 
    label: "Midnight Purple", 
    icon: Moon,
    gradient: "from-indigo-900 via-purple-900 to-slate-900",
    primary: "#8B5CF6",
    secondary: "#EC4899",
    description: "Deep purple tones for late night coding"
  },
  { 
    name: "sunset", 
    label: "Sunset Glow", 
    icon: Sun,
    gradient: "from-orange-600 via-pink-600 to-purple-600",
    primary: "#F97316",
    secondary: "#EC4899",
    description: "Warm and vibrant sunset colors"
  },
  { 
    name: "ocean", 
    label: "Ocean Breeze", 
    icon: Cloud,
    gradient: "from-cyan-600 via-blue-600 to-indigo-600",
    primary: "#06B6D4",
    secondary: "#3B82F6",
    description: "Cool and calming ocean blues"
  },
  { 
    name: "forest", 
    label: "Forest Night", 
    icon: Star,
    gradient: "from-green-900 via-emerald-900 to-teal-900",
    primary: "#10B981",
    secondary: "#14B8A6",
    description: "Natural green forest vibes"
  },
  { 
    name: "candy", 
    label: "Candy Pop", 
    icon: Heart,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    primary: "#EC4899",
    secondary: "#F43F5E",
    description: "Sweet and playful pink tones"
  },
  { 
    name: "neon", 
    label: "Neon Dreams", 
    icon: Zap,
    gradient: "from-purple-600 via-pink-600 to-blue-600",
    primary: "#A855F7",
    secondary: "#EC4899",
    description: "Electric neon cyberpunk style"
  },
  { 
    name: "autumn", 
    label: "Autumn Leaves", 
    icon: Flame,
    gradient: "from-amber-700 via-orange-700 to-red-700",
    primary: "#F59E0B",
    secondary: "#DC2626",
    description: "Warm autumn color palette"
  },
  { 
    name: "mocha", 
    label: "Mocha Latte", 
    icon: Coffee,
    gradient: "from-amber-900 via-stone-800 to-stone-900",
    primary: "#92400E",
    secondary: "#78350F",
    description: "Rich coffee brown tones"
  }
];

const MockMessage = ({ isUser, text, gradient }: { isUser: boolean; text: string; gradient: string }) => (
  <motion.div
    initial={{ opacity: 0, x: isUser ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
  >
    <div
      className={`max-w-[70%] p-3 rounded-2xl ${
        isUser 
          ? `bg-gradient-to-br ${gradient}` 
          : "bg-white/10 backdrop-blur-sm"
      } text-white text-sm shadow-lg`}
    >
      {text}
    </div>
  </motion.div>
);

const ThemePicker = () => {
  const { appTheme, setAppTheme } = useThemeStore();

  const selectedTheme = themes.find(t => t.name === appTheme) ?? themes[0];

  const handleApply = (themeName: AppTheme) => {
    setAppTheme(themeName);
    toast.success(`✨ ${themes.find(t => t.name === themeName)?.label} theme applied!`, {
      style: { background: "#1e1e2e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--gradient-bg)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/">
            <Button variant="ghost" className="gap-2 hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Palette size={40} className="text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Theme Studio
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Customize your chat experience with stunning themes
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Currently active: <span className="text-primary font-semibold">{selectedTheme.label}</span>
          </p>
        </motion.div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {themes.map((theme, index) => {
            const Icon = theme.icon;
            const isSelected = appTheme === theme.name;

            return (
              <motion.div
                key={theme.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className={`relative cursor-pointer rounded-2xl overflow-hidden ${
                  isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/50" : ""
                }`}
              >
                {/* Theme Preview Card */}
                <Card
                  className={`h-52 bg-gradient-to-br ${theme.gradient} p-4 flex flex-col justify-between relative overflow-hidden border-none`}
                  onClick={() => handleApply(theme.name)}
                >
                  {/* Animated bg glows */}
                  <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
                  </div>

                  {/* Icon */}
                  <div className="relative">
                    <Icon size={32} className="text-white" />
                  </div>

                  {/* Theme Info */}
                  <div className="relative">
                    <h3 className="text-white font-bold text-lg mb-1">{theme.label}</h3>
                    <p className="text-white/70 text-xs mb-3">{theme.description}</p>
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: theme.secondary }}
                      />
                    </div>
                  </div>

                  {/* Selected badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg"
                      >
                        <Check size={16} className="text-green-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Apply label on hover */}
                  {!isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl"
                    >
                      <span className="text-white font-semibold text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                        Apply Theme
                      </span>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Live Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Eye className="text-primary" size={24} />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Live Preview</h2>
                <span className="text-sm text-muted-foreground">{selectedTheme.label}</span>
              </div>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => handleApply(selectedTheme.name)}
            >
              <Check size={16} />
              {appTheme === selectedTheme.name ? "Theme Active" : "Apply Theme"}
            </Button>
          </div>

          {/* Mock Chat Preview */}
          <div className={`bg-gradient-to-br ${selectedTheme.gradient} rounded-2xl p-6 min-h-[320px] relative overflow-hidden`}>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative">
              <MockMessage text="Hey! Check out this new theme 🎨" isUser={false} gradient={selectedTheme.gradient} />
              <MockMessage text="Wow! This looks amazing! 😍" isUser={true} gradient={selectedTheme.gradient} />
              <MockMessage text="I love the colors and gradients!" isUser={false} gradient={selectedTheme.gradient} />
              <MockMessage text="The animations are so smooth! ✨" isUser={true} gradient={selectedTheme.gradient} />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-4"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-white/60 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-white/60 text-sm">Someone is typing...</span>
              </motion.div>
            </div>
          </div>

          {/* Color chips */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Primary Color", value: selectedTheme.primary, color: selectedTheme.primary },
              { label: "Secondary Color", value: selectedTheme.secondary, color: selectedTheme.secondary },
              { label: "Theme Style", value: "Gradient Dark", color: null }
            ].map((info, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.04 }}
                className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border"
              >
                <p className="text-muted-foreground text-sm mb-2">{info.label}</p>
                <div className="flex items-center gap-2">
                  {info.color && (
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: info.color }} />
                  )}
                  <p className="text-foreground font-semibold">{info.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemePicker;
