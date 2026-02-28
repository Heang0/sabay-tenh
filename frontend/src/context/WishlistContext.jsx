import { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

const API_URL = import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://sabay-tenh.onrender.com/api';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistIds, setWishlistIds] = useState([]);
    const { isLoggedIn, getToken } = useUser();

    // Fetch wishlist IDs when user logs in
    useEffect(() => {
        if (isLoggedIn) {
            fetchWishlistIds();
        } else {
            setWishlistIds([]);
        }
    }, [isLoggedIn]);

    const fetchWishlistIds = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const response = await fetch(`${API_URL}/wishlist/ids`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWishlistIds(data.productIds || []);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistIds.includes(productId);
    };

    const toggleWishlist = async (productId) => {
        if (!isLoggedIn) {
            return { success: false, needLogin: true };
        }

        try {
            const token = await getToken();
            if (isInWishlist(productId)) {
                await fetch(`${API_URL}/wishlist/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setWishlistIds(prev => prev.filter(id => id !== productId));
            } else {
                await fetch(`${API_URL}/wishlist/${productId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setWishlistIds(prev => [...prev, productId]);
            }
            return { success: true };
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            return { success: false };
        }
    };

    const value = {
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        fetchWishlistIds,
        wishlistCount: wishlistIds.length
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
