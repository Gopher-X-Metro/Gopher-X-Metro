// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {deleteToken,getMessaging,getToken,MessagePayload,onMessage,isSupported} from "firebase/messaging";
import { firebaseConfig, vapidKey } from "./Config.ts";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
});

async function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {

    if (permission === "granted") {
      console.log("Notification permission granted.");
      return true;
    }

  });
  return false;
}

export function test() {
  if (!requestPermission()) {
    return;
  }
  if (!isSupported()) {
    return;
  }

  const messaging = getMessaging();

  // Get registration token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  getToken(messaging, {
    vapidKey,
  })
    .then((currentToken) => {
      if (currentToken) {
        console.log("Token: ", currentToken);
        // Send the token to your server and update the UI if necessary
        // ...
      } else {
        // Show permission request UI
        console.log(
          "No registration token available. Request permission to generate one.",
        );
      }
    }).catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
}
