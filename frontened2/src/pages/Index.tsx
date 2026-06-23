import { useState } from "react";
import { FloatingBubblesSidebar } from "@/components/FloatingBubblesSidebar";
import { ChatArea } from "@/components/ChatArea";
import { Navbar } from "@/components/Navbar";
import { useChatStore } from "@/stores/useChatStore";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedUser, setSelectedUser } = useChatStore();

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      {/* Navbar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-20 left-4 z-50 md:hidden glass-effect rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Sidebar with Floating Bubbles */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 top-16 left-0 z-40 w-80 h-[calc(100vh-4rem)] glass-effect border-r transition-transform duration-300 ease-in-out md:relative md:inset-y-0 md:top-0 md:translate-x-0 md:h-full`}
        >
          <FloatingBubblesSidebar
            onSelectContact={(user) => {
              setSelectedUser(user);
              setSidebarOpen(false);
            }}
            selectedContactId={selectedUser?._id || null}
          />
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 min-w-0 h-full overflow-hidden">
          <ChatArea contact={selectedUser} />
        </main>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
