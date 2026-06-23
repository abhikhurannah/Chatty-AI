import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, LogOut, MessageCircle, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SettingsDialog } from "./SettingsDialog";
import { AIToggle } from "./AIToggle";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAIStore } from "@/stores/useAIStore";

export const Navbar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { authUser, logout } = useAuthStore();
  const { isAIEnabled, selectedTone } = useAIStore();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getToneColor = (tone: string) => {
    const colors: Record<string, string> = {
      casual: 'bg-blue-500',
      professional: 'bg-purple-500',
      flirty: 'bg-pink-500',
      friendly: 'bg-green-500',
      formal: 'bg-indigo-500',
      humorous: 'bg-orange-500',
    };
    return colors[tone] || 'bg-gray-500';
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-6 py-3 bg-card/50 backdrop-blur-md shadow-sm border-b border-border"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-105 transition-transform"
            whileHover={{ rotate: 5 }}
          >
            <MessageCircle className="text-primary-foreground h-5 w-5" />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-1">
              Chatty{" "}
              <motion.span 
                className="relative inline-block"
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-extrabold relative z-10">
                  AI
                </span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 blur-sm opacity-50"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  AI
                </motion.span>
              </motion.span>
            </h1>
            <p className="text-xs text-muted-foreground">AI-Powered Messaging</p>
          </div>
        </Link>

        {/* AI Status Badge */}
        {isAIEnabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-full"
          >
            <div className={`w-2 h-2 rounded-full ${getToneColor(selectedTone)} animate-pulse`} />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              AI: {selectedTone}
            </span>
          </motion.div>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* AI Toggle */}
          <AIToggle />
          
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 hover:bg-muted">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={authUser?.profilePic} alt={authUser?.fullname} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-semibold">
                    {authUser?.fullname ? getInitials(authUser.fullname) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[100px] truncate">
                  {authUser?.fullname?.split(" ")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-card border-border shadow-lg"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="font-medium text-foreground text-sm">{authUser?.fullname}</p>
                <p className="text-xs text-muted-foreground truncate">{authUser?.email}</p>
              </div>
              
              <Link to="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              
              <Link to="/themes">
                <DropdownMenuItem className="cursor-pointer">
                  <Palette className="mr-2 h-4 w-4 text-secondary" />
                  <span>Themes</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem 
                onClick={() => setSettingsOpen(true)}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.nav>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};