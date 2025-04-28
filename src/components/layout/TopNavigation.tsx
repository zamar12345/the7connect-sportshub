
import { useState } from "react";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";

interface TopNavigationProps {
  hideTopNav?: boolean;
}

const TopNavigation = ({ hideTopNav = false }: TopNavigationProps) => {
  const { user, profile } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  if (hideTopNav) {
    return null;
  }

  return (
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
  );
};

export default TopNavigation;
