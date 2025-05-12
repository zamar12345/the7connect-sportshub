
// Service worker for push notifications

self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event has no data.');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || 'New notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: data.url || '/notifications'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SportHub Notification', options)
    );
  } catch (err) {
    console.error('Error showing notification:', err);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/notifications';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, focus it
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
