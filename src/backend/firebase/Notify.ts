import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";

import { createClient } from "@supabase/supabase-js";

const firebaseConfig = {
  apiKey: "AIzaSyBxH5sCXBWW7J0eKzLNbAzfsVMt85B6Le4",
  authDomain: "sandboxgxmtest.firebaseapp.com",
  projectId: "sandboxgxmtest",
  storageBucket: "sandboxgxmtest.appspot.com",
  messagingSenderId: "793277942657",
  appId: "1:793277942657:web:20796b4b6e3d662419f680",
};

const vapidKey =
  "BIzzL-h_-fxtywFbOEwcWhvnuA2-bslzyIDRaHhdqfUYdT61LhxVcwdkvJRnqy8jc4xwKRekeTamM1HrAVW75o0";

const supabase = createClient(
  "https://tsmoowqflkcgsdrlxicc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbW9vd3FmbGtjZ3Nkcmx4aWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIyNzU2NzYsImV4cCI6MjAyNzg1MTY3Nn0.Mbt6K4ZDGyzKiSuItnI68Yj47fCg6u-MIqu1sHcXrls",
);


let notificationPermission = false;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  console.log("Message received via Notify TS. ", payload);
});

/**
 * Requests permission for displaying notifications.
 * @returns {Promise<boolean>} A promise that resolves to true if permission is granted, false otherwise.
 */
export async function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      notificationPermission = true;
      return true;
    }
  });
  notificationPermission = false;
  return false;
}

/**
 * Retrieves the FCM token for push notifications.
 * @returns {Promise<void>} A promise that resolves with the FCM token.
 */
export async function getFCMToken() {
  if (notificationPermission === false) {
    console.log("Notification permissions not properly allowed, cannot subscribe user to notifications")
    return; 
  }


  // Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  let token; 
  try {
    token = await getToken(messaging, {
      vapidKey,
    });
  } catch (err) {
    console.log("found error where there should not be: " + err);
    console.log("this error initiated from Notify.ts, if you spot this error, the service worker may not have loaded expectedly")

  }

  console.log(token);
}

/**
 * Registers a service worker when the page loads.
 */
export function registerServiceWorkerOnLoad() {
  if (navigator.serviceWorker) {
    // Register the SW
    navigator.serviceWorker.register('/firebase-messaging-sw.js', {scope: '/firebase-cloud-messaging-push-scope'}).then(function(registration){
    }).catch(console.log);
  }
  else {
    console.log("service workers may not be supported")
  }
}




