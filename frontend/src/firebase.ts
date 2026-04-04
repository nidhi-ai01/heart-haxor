import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDUqyDQUqfDtc8XaO0OSI48DBW_EVuw-CQ",
  authDomain: "hearthaxor.com",
  projectId: "heart-haxor-cea66",
  storageBucket: "heart-haxor-cea66.appspot.com",
  messagingSenderId: "422983093207",
  appId: "1:422983093207:web:a58442027336de9cd11992"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
