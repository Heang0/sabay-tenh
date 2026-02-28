import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAEy9zFLA7y9eI_TTEIkjonJvN5R0yHGTQ",
    authDomain: "e-commerce-4f336.firebaseapp.com",
    projectId: "e-commerce-4f336",
    storageBucket: "e-commerce-4f336.firebasestorage.app",
    messagingSenderId: "624018910781",
    appId: "1:624018910781:web:fc91e3c419278fac764454",
    measurementId: "G-L8J4LGCBS9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
