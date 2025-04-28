
import MobileLayout from "@/components/layout/MobileLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers } from "@/data/mockData";
import { MessageSquare, Heart, Repeat2, UserPlus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const notifications = [
  {
    id: "notif-1",
    type: "like",
    user: mockUsers[1],
    content: "liked your post",
    postPreview: "Just finished an amazing training session! Feeling ready for...",
    time: "2m",
    read: false
  },
  {
    id: "notif-2",
    type: "follow",
    user: mockUsers[2],
    content: "started following you",
    time: "1h",
    read: false
  },
  {
    id: "notif-3",
    type: "comment",
    user: mockUsers[3],
    content: "commented on your post",
    comment: "Great technique! Keep it up! 💯",
    time: "3h",
    read: true
  },
  {
    id: "notif-4",
    type: "repost",
    user: mockUsers[1],
    content: "reposted your post",
    postPreview: "Game day! Who's coming to support us tonight?",
    time: "5h",
    read: true
  },
  {
    id: "notif-5",
    type: "donation",
    user: mockUsers[2],
    content: "sent you a donation",
    amount: "$25.00",
    time: "1d",
    read: true
  }
];

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

const Notifications = () => {
  return (
    <MobileLayout>
      <div className="flex flex-col">
        <div className="border-b border-border py-3 px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          <Button variant="ghost" size="sm">
            Mark all as read
          </Button>
        </div>
        
        <div>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 border-b border-border flex ${notification.read ? "" : "bg-primary/5"}`}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">{notification.user.name}</span>
                    <span className="text-muted-foreground text-sm">{notification.content}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                    <span className="ml-2">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                </div>
                
                {notification.type === "comment" && notification.comment && (
                  <p className="mt-1 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    "{notification.comment}"
                  </p>
                )}
                
                {notification.postPreview && (
                  <p className="mt-1 text-sm text-muted-foreground truncate">
                    "{notification.postPreview}"
                  </p>
                )}
                
                {notification.type === "donation" && notification.amount && (
                  <p className="mt-1 text-sm text-sport-orange font-semibold">
                    Amount: {notification.amount}
                  </p>
                )}
                
                {notification.type === "follow" && (
                  <Button size="sm" variant="outline" className="mt-2">
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
      </div>
    </MobileLayout>
  );
};

export default Notifications;
