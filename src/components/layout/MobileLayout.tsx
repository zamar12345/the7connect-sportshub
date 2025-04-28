import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Bell, 
  MessageSquare, 
  User, 
  PenSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Search, path: "/explore", label: "Explore" },
    { icon: Bell, path: "/notifications", label: "Notifications" },
    { icon: MessageSquare, path: "/messages", label: "Messages" },
    { icon: User, path: "/profile", label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-10 border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <Logo />
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <div className="w-8 h-8 rounded-full bg-sport-green/20 flex items-center justify-center">
                <User size={18} className="text-sport-green" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-16 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-background/80 backdrop-blur-md z-10 border-t border-border">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg w-12 h-12",
                isActive(item.path) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* Floating new post button */}
      <Button 
        onClick={() => navigate("/compose")} 
        className="fixed right-4 bottom-20 bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 shadow-lg z-20"
      >
        <PenSquare size={20} />
      </Button>
    </div>
  );
};

export default MobileLayout;
