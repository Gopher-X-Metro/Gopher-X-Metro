// notify.ts

// Check if browser supports notifications
function isNotificationSupported(): boolean {
    return 'Notification' in window;
}

// Request permission to display notifications
async function requestNotificationPermission(): Promise<boolean> {
    if (!isNotificationSupported()) {
        console.error('Notifications are not supported in this browser.');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Display a browser notification
function showNotification(title: string, options: NotificationOptions): void {
    if (!isNotificationSupported()) {
        console.error('Notifications are not supported in this browser.');
        return;
    }

    if (Notification.permission !== 'granted') {
        console.warn('Permission to display notifications not granted.');
        return;
    }

    new Notification(title, options);
}

export { isNotificationSupported, requestNotificationPermission, showNotification };
