import { initializeApp} from "firebase/app";
import { getFirestore} from "firebase/firestore";
import { getStorage} from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAJnv8rtowuuRlwn2MRsGdzUkq--cig6Sg",
    authDomain: "react-blogs-app-b49dd.firebaseapp.com",
    projectId: "react-blogs-app-b49dd",
    storageBucket: "react-blogs-app-b49dd.appspot.com",
    messagingSenderId: "743319631529",
    appId: "1:743319631529:web:3a26e5767ccbd51cf31bb8"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  export {auth, db, storage};