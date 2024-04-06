// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3o9UUOJ2xuV0zJr1zUWdWuDJuKeu_oHA",
  authDomain: "gopher-x-metro.firebaseapp.com",
  projectId: "gopher-x-metro",
  storageBucket: "gopher-x-metro.appspot.com",
  messagingSenderId: "426388269171",
  appId: "1:426388269171:web:0301fc723626584fd42206",
  measurementId: "G-9D0HN8MPVE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging();
// Add the public key generated from the console here.
getToken(messaging, {vapidKey: "BFHVjy-c13qU-ihnLFzru2kguRerHYpJ7CR-ADkDBXTwJivFXm5vHEND0F8UTfxfVkFJjPWh8iNhf1S9P2UE4u0"});


function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');



    // Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
getToken(messaging, { vapidKey: '<YOUR_PUBLIC_VAPID_KEY_HERE>' }).then((currentToken) => {
  if (currentToken) {
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});