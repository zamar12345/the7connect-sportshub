
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Search, Bell, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";

interface BottomNavigationProps {
  hideBottomNav?: boolean;
}

const BottomNavigation = ({ hideBottomNav = false }: BottomNavigationProps) => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();

  if (hideBottomNav) {
    return null;
  }
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="sticky bottom-0 border-t border-border bg-background p-2 flex justify-around z-20">
      <Link to="/">
        <Button 
          variant={isActive('/') ? "default" : "ghost"} 
          size="icon" 
          className={cn(
            "rounded-full h-12 w-12",
            isActive('/') ? "bg-primary text-primary-foreground" : ""
          )}
        >
          <HomeIcon size={24} />
        </Button>
      </Link>
      
      <Link to="/explore">
        <Button 
          variant={isActive('/explore') ? "default" : "ghost"} 
          size="icon" 
          className={cn(
            "rounded-full h-12 w-12",
            isActive('/explore') ? "bg-primary text-primary-foreground" : ""
          )}
        >
          <Search size={24} />
        </Button>
      </Link>
      
      <Link to="/notifications">
        <div className="relative">
          <Button 
            variant={isActive('/notifications') ? "default" : "ghost"} 
            size="icon" 
            className={cn(
              "rounded-full h-12 w-12",
              isActive('/notifications') ? "bg-primary text-primary-foreground" : ""
            )}
          >
            <Bell size={24} />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-sport-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </Link>
      
      <Link to="/messages">
        <Button 
          variant={isActive('/messages') ? "default" : "ghost"} 
          size="icon" 
          className={cn(
            "rounded-full h-12 w-12",
            isActive('/messages') ? "bg-primary text-primary-foreground" : ""
          )}
        >
          <MessageSquare size={24} />
        </Button>
      </Link>
      
      <Link to={user ? `/profile/${profile?.username}` : '/auth'}>
        <Button 
          variant={isActive(`/profile/${profile?.username}`) ? "default" : "ghost"} 
          size="icon" 
          className={cn(
            "rounded-full h-12 w-12",
            isActive(`/profile/${profile?.username}`) ? "bg-primary text-primary-foreground" : ""
          )}
        >
          <User size={24} />
        </Button>
      </Link>
    </div>
  );
};

export default BottomNavigation;
