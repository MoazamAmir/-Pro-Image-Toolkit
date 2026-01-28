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
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAU3nW4QEqW5rMo5kS5P0FitjxFVqn5nHc",
    authDomain: "pro-image-toolkit-1.firebaseapp.com",
    projectId: "pro-image-toolkit-1",
    storageBucket: "pro-image-toolkit-1.firebasestorage.app",
    messagingSenderId: "963291465289",
    appId: "1:963291465289:web:0a6786dc286adc2ca76198",
    measurementId: "G-WEYXB4TTSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Set persistence as default
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Persistence Error:", error);
});

// Google Sign In - FIXED VERSION
export const signInWithGoogle = async () => {
    try {
        console.log(">>> DIAGNOSTIC: Google Popup Initiated");

        // Create a new provider instance for each login attempt
        const provider = new GoogleAuthProvider();

        // Add proper scopes for email access
        provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');

        // Force account selection
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const result = await signInWithPopup(auth, provider);

        if (result && result.user) {
            console.log(">>> DIAGNOSTIC: Login Success!");
            console.log(">>> USER_OBJECT:", result.user);

            // Extract complete user data
            const userData = {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                emailVerified: result.user.emailVerified,
                providerId: result.user.providerData[0]?.providerId || 'google.com',
                metadata: result.user.metadata
            };

            console.log(">>> USER_EMAIL:", userData.email || "NO_EMAIL_FOUND");
            console.log(">>> DISPLAY_NAME:", userData.displayName || "NO_NAME_FOUND");
            console.log(">>> COMPLETE_USER_DATA:", userData);

            // Fallback: Try to get email from providerData if main email is null
            if (!userData.email && result.user.providerData && result.user.providerData.length > 0) {
                userData.email = result.user.providerData[0].email;
                console.log(">>> EMAIL_FROM_PROVIDER:", userData.email);
            }

            // Additional fallback: Get from credential
            if (!userData.email && result._tokenResponse?.email) {
                userData.email = result._tokenResponse.email;
                console.log(">>> EMAIL_FROM_TOKEN:", userData.email);
            }

            // If email is still null, this is a critical error
            if (!userData.email) {
                console.error(">>> CRITICAL: Email is null even after all fallbacks!");
                console.log(">>> PROVIDER_DATA:", result.user.providerData);
                return {
                    user: null,
                    error: "Failed to retrieve email. Please ensure you've granted email permission to the app."
                };
            }

            return { user: result.user, error: null };
        }

        console.warn(">>> DIAGNOSTIC: result object exists but user is missing", result);
        return { user: null, error: "Authenticated but user data is missing." };
    } catch (error) {
        console.error(">>> Firebase Error Code:", error.code);
        console.error(">>> Full Error:", error);

        let friendlyError = "Something went wrong.";

        switch (error.code) {
            case 'auth/popup-closed-by-user':
                friendlyError = "Login window closed. Please try again.";
                break;
            case 'auth/popup-blocked':
                friendlyError = "Popup was blocked. Please allow popups for this site.";
                break;
            case 'auth/unauthorized-domain':
                friendlyError = "Domain not authorized. Check Firebase Console under Authentication > Settings > Authorized domains.";
                break;
            case 'auth/cancelled-popup-request':
                friendlyError = "Login cancelled. Please try again.";
                break;
            case 'auth/network-request-failed':
                friendlyError = "Network error. Check your internet connection.";
                break;
            case 'auth/internal-error':
                friendlyError = "Internal error. Please try again later.";
                break;
            default:
                friendlyError = error.message;
        }

        return { user: null, error: friendlyError };
    }
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password) => {
    try {
        console.log(">>> Attempting Email Signup:", email);
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log(">>> Signup Success!");
        return { user: result.user, error: null };
    } catch (error) {
        console.error(">>> Signup Error:", error.code);

        let friendlyError = "Signup failed.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                friendlyError = "Email already in use. Try logging in instead.";
                break;
            case 'auth/weak-password':
                friendlyError = "Password is too weak. Use at least 6 characters.";
                break;
            case 'auth/invalid-email':
                friendlyError = "Invalid email address.";
                break;
            default:
                friendlyError = error.message;
        }

        return { user: null, error: friendlyError };
    }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
    try {
        console.log(">>> Attempting Email Login:", email);
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log(">>> Login Success!");
        return { user: result.user, error: null };
    } catch (error) {
        console.error(">>> Login Error:", error.code);

        let friendlyError = "Login failed.";
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                friendlyError = "Invalid email or password. Please check your credentials or sign up if you don't have an account.";
                break;
            case 'auth/wrong-password':
                friendlyError = "Incorrect password.";
                break;

            case 'auth/invalid-email':
                friendlyError = "Invalid email address.";
                break;
            case 'auth/user-disabled':
                friendlyError = "This account has been disabled.";
                break;
            default:
                friendlyError = error.message;
        }

        return { user: null, error: friendlyError };
    }
};

// Logout
export const logOut = async () => {
    try {
        console.log(">>> Logging out...");
        await signOut(auth);
        console.log(">>> Logout Success!");
        return { error: null };
    } catch (error) {
        console.error(">>> Logout Error:", error);
        return { error: error.message };
    }
};

// Auth State Listener
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log(">>> Auth State Changed: User Logged In", user.email);
        } else {
            console.log(">>> Auth State Changed: No User");
        }
        callback(user);
    });
};

// Fallback for redirect flow (not needed for popup flow but kept for compatibility)
export const getGoogleRedirectResult = async () => {
    return { user: null, error: null };
};

export { auth };