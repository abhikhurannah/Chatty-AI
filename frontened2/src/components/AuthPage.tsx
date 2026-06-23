import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export const AuthPage = () => {
  const { login, signup, isLoggingIn, isSigningUp } = useAuthStore();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    fullname: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div 
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                Welcome to Chatty{" "}
                <motion.span 
                  className="relative inline-block"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-extrabold relative z-10">
                    AI
                  </span>
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 blur-lg opacity-50"
                    animate={{ 
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    AI
                  </motion.span>
                </motion.span>
              </CardTitle>
              <CardDescription className="text-base mt-2">AI-powered chat and real-time messaging</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity mt-6" 
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-fullname" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="register-fullname"
                      type="text"
                      placeholder="John Doe"
                      value={registerData.fullname}
                      onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity mt-6"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};