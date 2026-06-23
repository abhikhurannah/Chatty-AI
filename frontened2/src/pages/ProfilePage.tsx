import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, User, Mail, Calendar, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

const gradients = [
  "from-purple-900 via-blue-900 to-indigo-900",
  "from-slate-900 via-purple-900 to-slate-900",
  "from-indigo-900 via-purple-900 to-pink-900",
  "from-gray-900 via-purple-900 to-gray-900",
];

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [gradientIndex, setGradientIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setGradientIndex((prev) => (prev + 1) % gradients.length);
        setTransitioning(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setSelectedImg(base64String);
      
      try {
        await updateProfile({ profilePic: base64String });
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        toast.error("Failed to update profile picture");
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[gradientIndex]} transition-all duration-1000 ease-in-out ${
          transitioning ? "opacity-75" : "opacity-100"
        }`}
      />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto py-8 px-4 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/10 group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Chat
              </Button>
            </Link>
          </motion.div>

          {/* Profile Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <CardTitle className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <User className="h-8 w-8" />
                  Profile Information
                </CardTitle>
              </motion.div>
              <p className="text-white/70">Manage your account details</p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Avatar Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                  <Avatar className="relative h-32 w-32 border-4 border-white/30">
                    <AvatarImage
                      src={selectedImg || authUser?.profilePic}
                      alt={authUser?.fullname}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl font-bold">
                      {authUser?.fullname ? getInitials(authUser.fullname) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-3 cursor-pointer shadow-lg transition-all hover:scale-110 ${
                      isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                    }`}
                  >
                    <Camera className="h-5 w-5" />
                  </label>
                  
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </div>
                
                {isUpdatingProfile && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/70 text-sm mt-2"
                  >
                    Updating profile picture...
                  </motion.p>
                )}
              </motion.div>

              {/* User Information */}
              <div className="grid gap-6">
                <InfoField 
                  label="Full Name" 
                  value={authUser?.fullname || "Not set"} 
                  icon={<User className="h-5 w-5 text-blue-400" />}
                  delay={0.5}
                />
                
                <InfoField 
                  label="Email Address" 
                  value={authUser?.email || "Not set"} 
                  icon={<Mail className="h-5 w-5 text-green-400" />}
                  delay={0.6}
                />
                
                <InfoField 
                  label="Member Since" 
                  value="Recent Member" 
                  icon={<Calendar className="h-5 w-5 text-purple-400" />}
                  delay={0.7}
                />
                
                <InfoField 
                  label="Account Status" 
                  value={<Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>} 
                  icon={<CheckCircle className="h-5 w-5 text-green-400" />}
                  delay={0.8}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

interface InfoFieldProps {
  label: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  delay: number;
}

const InfoField = ({ label, value, icon, delay }: InfoFieldProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="space-y-2"
  >
    <label className="text-sm font-medium text-white/80">{label}</label>
    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex-shrink-0">{icon}</div>
      <div className="text-white font-medium">{value}</div>
    </div>
  </motion.div>
);

export default ProfilePage;