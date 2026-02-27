import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        console.log('🔄 Loading cart from localStorage:', savedCart);
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                console.log('✅ Cart loaded:', parsedCart);
                setCart(parsedCart);
            } catch (error) {
                console.error('❌ Error parsing cart:', error);
            }
        } else {
            console.log('📭 No cart found in localStorage');
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        console.log('💾 Saving cart to localStorage:', cart);
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000); // Changed from 2500 to 3000
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Add to cart
    const addToCart = (product, quantity = 1) => {
        console.log('➕ Adding to cart:', product.nameEn, 'quantity:', quantity);
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id);

            if (existingItem) {
                console.log('🔄 Updating existing item');
                // Show notification for update
                setNotification({
                    product,
                    quantity: existingItem.quantity + quantity,
                    isNew: false
                });
                return prevCart.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                console.log('🆕 Adding new item');
                // Show notification for new item
                setNotification({
                    product,
                    quantity,
                    isNew: true
                });
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        console.log('❌ Removing from cart:', productId);
        setCart(prevCart => prevCart.filter(item => item._id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        console.log('🔄 Updating quantity:', productId, 'to', newQuantity);
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item._id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        console.log('🗑️ Clearing cart');
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.salePrice || item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const getItemCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const toggleCart = () => {
        setIsOpen(!isOpen);
    };

    return (
        <CartContext.Provider value={{
            cart,
            isOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getItemCount,
            toggleCart,
            setIsOpen
        }}>
            {children}

            {/* Professional Popup with Image - Fully Responsive */}
            {notification && (
                <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 animate-slide-up">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden">
                        <div className="p-3 sm:p-4">
                            <div className="flex items-center gap-3">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={notification.product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_60/') || 'https://via.placeholder.com/60'}
                                        alt={notification.product.nameEn}
                                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-gray-100"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-khmer text-sm font-medium text-gray-800 truncate">
                                        {notification.product.nameKm}
                                    </p>
                                    <p className="font-sans text-xs text-gray-500 truncate">
                                        {notification.product.nameEn}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-[#005E7B]">
                                            ${((notification.product.salePrice || notification.product.price) * notification.quantity).toFixed(2)}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">Qty: {notification.quantity}</span>
                                    </div>
                                </div>

                                {/* Success Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* View Cart Link */}
                            <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setNotification(null);
                                        toggleCart();
                                    }}
                                    className="text-xs sm:text-sm text-[#005E7B] font-medium hover:text-[#004b63] transition-colors"
                                >
                                    View Cart →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};