import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIXcIr6rAzLgljJ8ikjFGt6QQw8hI6ol4",
  authDomain: "crop-react-image.firebaseapp.com",
  projectId: "crop-react-image",
  storageBucket: "crop-react-image.appspot.com",
  messagingSenderId: "686665016558",
  appId: "1:686665016558:web:783f66e54c6374ab37ffff",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
