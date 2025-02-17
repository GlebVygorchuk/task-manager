import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyBRlqaCNl3h2IH-LCEhM1L4Whbf13jSw1U",
    authDomain: "task-manager-9bd2b.firebaseapp.com",
    projectId: "task-manager-9bd2b",
    storageBucket: "task-manager-9bd2b.firebasestorage.app",
    messagingSenderId: "769848731629",
    appId: "1:769848731629:web:2f97fbf5fddfacd83ae9e4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const database = getFirestore(app)
