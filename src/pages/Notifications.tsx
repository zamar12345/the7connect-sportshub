
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Repeat2, UserPlus, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { fetchNotifications, markAllNotificationsAsRead } from "@/services/notificationService";
import { toggleFollow } from "@/services/followService";
import { toast } from "sonner";

interface NotificationActor {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface Notification {
  id: string;
  type: string;
  content: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
  actor_id: string;
  actor: NotificationActor;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsData = await fetchNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleFollowBack = async (actorId: string) => {
    try {
      await toggleFollow(actorId);
      toast.success("You are now following this user");
      // Refresh notifications to update UI
      loadNotifications();
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec}s`;
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={16} className="text-sport-orange" />;
      case "comment":
        return <MessageSquare size={16} className="text-primary" />;
      case "repost":
        return <Repeat2 size={16} className="text-sport-green" />;
      case "follow":
        return <UserPlus size={16} className="text-primary" />;
      case "donation":
        return <CreditCard size={16} className="text-sport-orange" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-112px)]">
          <p className="text-lg font-semibold mb-2">Sign in to view notifications</p>
          <p className="text-muted-foreground text-center">
            Create an account or sign in to see your notifications.
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex flex-col">
        <div className="border-b border-border py-3 px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          {notifications.some(notif => !notif.is_read) && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border-b border-border flex ${notification.is_read ? "" : "bg-primary/5"}`}
              >
                <Avatar className="h-10 w-10 mr-3">
                  {notification.actor?.avatar_url ? (
                    <AvatarImage src={notification.actor.avatar_url} alt={notification.actor.full_name || notification.actor.username} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">
                        {notification.actor?.full_name || notification.actor?.username}
                      </span>
                      <span className="text-muted-foreground text-sm">{notification.content}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground">{formatTimestamp(notification.created_at)}</span>
                      <span className="ml-2">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                  </div>
                  
                  {notification.type === "follow" && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => handleFollowBack(notification.actor_id)}
                    >
                      <UserPlus size={14} className="mr-1" />
                      Follow back
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Notifications;
