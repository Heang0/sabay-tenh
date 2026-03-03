import { createContext, useState, useContext, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithCustomToken,
    updateProfile,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset
} from 'firebase/auth';

const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_URL = VITE_API_URL
    ? (VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL)
    : (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://sabay-tenh.onrender.com/api');

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                // Sync with backend
                await syncWithBackend(fbUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const syncWithBackend = async (fbUser) => {
        try {
            const token = await fbUser.getIdToken();
            const response = await fetch(`${API_URL}/users/google-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    displayName: fbUser.displayName,
                    photoURL: fbUser.photoURL
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUser({
                    ...data.user,
                    token // Store the Firebase token for API calls
                });
            }
        } catch (error) {
            console.error('Backend sync error:', error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
            // onAuthStateChanged will handle the rest
            return { success: true };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const signInWithEmail = async (email, password) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will sync with backend
            return { success: true };
        } catch (error) {
            console.error('Email sign-in error:', error);
            return { success: false, message: error.message, code: error.code };
        } finally {
            setLoading(false);
        }
    };

    const signInWithTelegram = async (telegramUser) => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/users/telegram-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(telegramUser)
            });

            const data = await response.json();
            if (!response.ok || !data.customToken) {
                return {
                    success: false,
                    message: data.message || 'Telegram sign-in failed'
                };
            }

            await signInWithCustomToken(auth, data.customToken);
            return { success: true };
        } catch (error) {
            console.error('Telegram sign-in error:', error);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const registerWithEmail = async (email, password, displayName) => {
        try {
            setLoading(true);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Update display name in Firebase
            await updateProfile(result.user, { displayName });
            // onAuthStateChanged will sync with backend
            return { success: true };
        } catch (error) {
            console.error('Email register error:', error);
            return { success: false, message: error.message, code: error.code };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setFirebaseUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Get fresh Firebase token for API calls
    const getToken = async () => {
        if (firebaseUser) {
            return await firebaseUser.getIdToken();
        }
        return null;
    };

    const resetPassword = async (email) => {
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, message: error.message, code: error.code };
        } finally {
            setLoading(false);
        }
    };

    const verifyResetCode = async (code) => {
        try {
            return await verifyPasswordResetCode(auth, code);
        } catch (error) {
            console.error('Verify reset code error:', error);
            throw error;
        }
    };

    const confirmReset = async (code, newPassword) => {
        try {
            await confirmPasswordReset(auth, code, newPassword);
            return { success: true };
        } catch (error) {
            console.error('Confirm reset error:', error);
            return { success: false, message: error.message, code: error.code };
        }
    };

    const value = {
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithTelegram,
        signInWithEmail,
        registerWithEmail,
        resetPassword,
        verifyResetCode,
        confirmReset,
        logout,
        getToken,
        isLoggedIn: !!user && !!firebaseUser
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
