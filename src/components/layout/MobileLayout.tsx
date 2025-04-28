
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Search, Bell, MessageSquare, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthProvider";
import Logo from "@/components/Logo";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";

interface MobileLayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideTopNav?: boolean;
}

const MobileLayout = ({ children, hideBottomNav = false, hideTopNav = false }: MobileLayoutProps) => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [showSearch, setShowSearch] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      {!hideTopNav && (
        <div className="sticky top-0 border-b border-border bg-background/80 backdrop-blur-md z-20 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="h-8" />
          </div>
          
          <div className="flex items-center space-x-1">
            {showSearch ? (
              <div className="w-64">
                <SearchBar 
                  placeholder="Search"
                  className="mr-2"
                />
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={20} />
              </Button>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                {user ? (
                  <div className="py-6">
                    <div className="flex items-center space-x-3 mb-8">
                      <Avatar className="h-12 w-12">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.username} />
                        ) : (
                          <AvatarFallback>
                            <User size={20} />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{profile?.full_name || profile?.username}</h3>
                        <p className="text-sm text-muted-foreground">@{profile?.username}</p>
                      </div>
                    </div>
                    
                    <nav className="space-y-2">
                      <Link to={`/profile/${profile?.username}`}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User size={18} className="mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Link to="/settings">
                        <Button variant="ghost" className="w-full justify-start">
                          Settings
                        </Button>
                      </Link>
                      <Link to="/donation-history">
                        <Button variant="ghost" className="w-full justify-start">
                          Donation History
                        </Button>
                      </Link>
                      <Link to="/help">
                        <Button variant="ghost" className="w-full justify-start">
                          Help Center
                        </Button>
                      </Link>
                    </nav>
                  </div>
                ) : (
                  <div className="py-6 space-y-4">
                    <h3 className="font-semibold text-xl">Welcome to SportHub</h3>
                    <p className="text-muted-foreground">Sign in to enjoy all features</p>
                    <div className="space-y-2">
                      <Link to="/auth?mode=signin">
                        <Button className="w-full">Sign In</Button>
                      </Link>
                      <Link to="/auth?mode=signup">
                        <Button variant="outline" className="w-full">Create Account</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideBottomNav && (
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
      )}
    </div>
  );
};

export default MobileLayout;
