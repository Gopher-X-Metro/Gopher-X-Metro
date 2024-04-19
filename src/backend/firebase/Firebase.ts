import { initializeApp } from 'firebase/app';
import { MessagePayload, deleteToken, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from './config';


export function initializeFirebase() {

    initializeApp(firebaseConfig);
    const messaging = getMessaging();


    onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
    });

}