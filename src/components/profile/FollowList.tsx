
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/FollowButton";
import { useAuth } from "@/context/AuthProvider";

interface User {
  id: string;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface FollowListProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  title: string;
  loading: boolean;
}

const FollowList = ({ isOpen, onClose, users, title, loading }: FollowListProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No {title.toLowerCase()} yet
          </div>
        ) : (
          <div className="space-y-1 pt-2">
            {users.map((userData) => (
              <div key={userData.id} className="py-2">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer" 
                    onClick={() => handleProfileClick(userData.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <img
                        src={userData.avatar_url || '/placeholder.svg'}
                        alt={userData.username || "User"}
                        className="object-cover"
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">
                        {userData.full_name || userData.username || "Unknown User"}
                      </p>
                      {userData.username && (
                        <p className="text-sm text-muted-foreground">
                          @{userData.username}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {user?.id !== userData.id && (
                    <FollowButton userId={userData.id} size="sm" />
                  )}
                </div>
                <Separator className="mt-2" />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowList;
