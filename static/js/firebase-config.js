import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBF8EEc5eOaOP7J21ZFrtb7kOjpFdYI4yk",
    authDomain: "lsb-96306.firebaseapp.com",
    projectId: "lsb-96306",
    storageBucket: "lsb-96306.firebasestorage.app",
    messagingSenderId: "540966454802",
    appId: "1:540966454802:web:a3e12460c6bda31a20bacb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export the auth service so other files can use it
export { auth };