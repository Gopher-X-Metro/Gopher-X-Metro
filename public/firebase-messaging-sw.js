import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";


const firebaseConfig = {
    apiKey: "AIzaSyB3o9UUOJ2xuV0zJr1zUWdWuDJuKeu_oHA",
    authDomain: "gopher-x-metro.firebaseapp.com",
    projectId: "gopher-x-metro",
    storageBucket: "gopher-x-metro.appspot.com",
    messagingSenderId: "426388269171",
    appId: "1:426388269171:web:0301fc723626584fd42206",
    measurementId: "G-9D0HN8MPVE",
  };

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseApp = initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = getMessaging(firebaseApp);