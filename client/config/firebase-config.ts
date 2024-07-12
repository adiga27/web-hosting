import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDRat6asqscp5ZdfP86txn4RlYZdp5xBoM",
  authDomain: "web-hosting-e63ef.firebaseapp.com",
  projectId: "web-hosting-e63ef",
  storageBucket: "web-hosting-e63ef.appspot.com",
  messagingSenderId: "1074299421763",
  appId: "1:1074299421763:web:46762957e95f07cf9a40f6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
