import { initializeApp } from "firebase/app";
import {getMessaging,getToken,onMessage,isSupported} from "firebase/messaging";



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





// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
