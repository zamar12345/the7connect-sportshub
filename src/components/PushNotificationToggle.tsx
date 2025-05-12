
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  requestNotificationPermission, 
  isPushNotificationSupported, 
  registerServiceWorker,
  subscribeToPushNotifications
} from "@/services/pushNotificationService";
import { registerForPushNotifications, unregisterFromPushNotifications } from "@/services/notificationService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";

interface PushNotificationToggleProps {
  className?: string;
}

const PushNotificationToggle = ({ className = "" }: PushNotificationToggleProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if push notifications are supported
    const supported = isPushNotificationSupported();
    setIsSupported(supported);
    
    // Check if already subscribed
    if (supported) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsEnabled(!!subscription);
        });
      });
    }
  }, []);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!user) {
      toast.error("You must be signed in to manage notifications");
      return;
    }
    
    if (enabled) {
      // Enable notifications
      const permissionGranted = await requestNotificationPermission();
      
      if (!permissionGranted) {
        toast.error("Notification permission denied");
        return;
      }
      
      const swRegistration = await registerServiceWorker();
      
      if (!swRegistration) {
        toast.error("Failed to register service worker");
        return;
      }
      
      const subscription = await subscribeToPushNotifications(swRegistration);
      
      if (!subscription) {
        toast.error("Failed to subscribe to push notifications");
        return;
      }
      
      // Register subscription on server
      const success = await registerForPushNotifications(subscription);
      
      if (success) {
        setIsEnabled(true);
        toast.success("Push notifications enabled");
      } else {
        toast.error("Failed to enable push notifications");
      }
    } else {
      // Disable notifications
      try {
        // Get the current subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Unsubscribe locally
          await subscription.unsubscribe();
          
          // Unregister on server
          await unregisterFromPushNotifications();
          
          setIsEnabled(false);
          toast.success("Push notifications disabled");
        }
      } catch (error) {
        console.error("Error disabling push notifications:", error);
        toast.error("Failed to disable push notifications");
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch
        id="push-notifications"
        checked={isEnabled}
        onCheckedChange={handleToggleNotifications}
      />
      <Label htmlFor="push-notifications">Push Notifications</Label>
    </div>
  );
};

export default PushNotificationToggle;
