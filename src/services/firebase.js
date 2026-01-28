// Firebase Configuration
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBI0cB_xjCGBdGAft8p_4xVIwWts6DI4qo",
    authDomain: "pro-image-toolkit.firebaseapp.com",
    projectId: "pro-image-toolkit",
    storageBucket: "pro-image-toolkit.firebasestorage.app",
    messagingSenderId: "612265861601",
    appId: "1:612265861601:web:7aea4a3db2bcda879b32a0",
    measurementId: "G-PCDN1DQ1G4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google Sign In Configuration
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export const signInWithGoogle = async () => {
    try {
        // persistence set karna takay user login rahay - set persistence once or use default
        await setPersistence(auth, browserLocalPersistence);

        console.log(">>> DIAGNOSTIC: Google Popup Initiated");
        const result = await signInWithPopup(auth, googleProvider);

        if (result && result.user) {
            console.log(">>> DIAGNOSTIC: Login Success!");
            console.log(">>> USER_OBJECT:", result.user);
            console.log(">>> USER_EMAIL:", result.user.email || "NO_EMAIL_FOUND");
            return { user: result.user, error: null };
        }

        console.warn(">>> DIAGNOSTIC: result object exists but user is missing", result);
        return { user: null, error: "Authenticated but user data is missing." };
    } catch (error) {
        console.error("Firebase Error:", error.code);

        let friendlyError = "Something went wrong.";
        if (error.code === 'auth/popup-closed-by-user') {
            friendlyError = "Login window closed. Please try again.";
        } else if (error.code === 'auth/unauthorized-domain') {
            friendlyError = "Domain not authorized. Check Firebase Console.";
        } else {
            friendlyError = error.message;
        }

        return { user: null, error: friendlyError };
    }
};

// --- Email/Password & Other Functions ---

export const signUpWithEmail = async (email, password) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};

// Fallback for redirect flow if needed by App.js
export const getGoogleRedirectResult = async () => {
    return { user: null, error: null };
};

export { auth };
