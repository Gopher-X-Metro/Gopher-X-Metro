import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";


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


messaging.onBackgroundMessage(payload => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };


  if (Notification.permission !== 'granted') {	
    console.warn('Permission to display notifications not granted.');	
    return;	
  }
  
  Notification.showNotification(notificationTitle, notificationOptions);
});