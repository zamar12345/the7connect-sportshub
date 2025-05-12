
/**
 * Requests permission for push notifications
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Checks the current notification permission status
 * @returns {string} The current permission status: 'granted', 'denied', or 'default'
 */
export const getNotificationPermissionStatus = (): string => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  return Notification.permission;
};

/**
 * Checks if the browser supports push notifications
 * @returns {boolean} Whether push is supported
 */
export const isPushNotificationSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Registers a service worker for push notifications
 * @returns {Promise<ServiceWorkerRegistration|null>} The service worker registration or null on failure
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushNotificationSupported()) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
};

/**
 * Subscribes to push notifications
 * @param {ServiceWorkerRegistration} registration - The service worker registration
 * @returns {Promise<PushSubscription|null>} The push subscription or null on failure
 */
export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // This is a placeholder - you'd need to replace with your actual VAPID public key
        'BOmhJFn8XS-xiiAOLwF8AB3SlwvXFumQQHt9B3pKyGG4C4bT5-nE-K8eO7lwVAQed6HXReKZrYwxQPw_NGMpXYg'
      )
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

/**
 * Opens browser settings to allow users to change notification permissions
 * This is a guidance function as direct access to change permissions isn't possible from JavaScript
 * @returns {void}
 */
export const openNotificationSettings = (): void => {
  if (navigator.userAgent.includes("Chrome")) {
    window.open('chrome://settings/content/notifications');
  } else if (navigator.userAgent.includes("Firefox")) {
    window.open('about:preferences#privacy');
  } else if (navigator.userAgent.includes("Safari")) {
    window.open('safari://settings/websites/notifications');
  } else {
    // Generic guidance for other browsers
    window.open('https://support.google.com/chrome/answer/3220216?hl=en');
  }
};

/**
 * Converts a URL-safe base64 string to a Uint8Array
 * @param {string} base64String - The base64 string to convert
 * @returns {Uint8Array} The converted array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
    
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
