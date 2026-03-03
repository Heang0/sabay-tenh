import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { translations } from '../context/translations';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const CartSidebar = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { isLoggedIn } = useUser();
    const t = translations[language];
    const {
        cart,
        isOpen,
        setIsOpen,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getItemCount
    } = useCart();

    const [checkoutStep, setCheckoutStep] = useState('cart');

    if (!isOpen) return null;

    const handleCheckout = () => {
        setIsOpen(false);
        if (!isLoggedIn) {
            navigate('/user-login');
            return;
        }
        navigate('/checkout');
    };

    const handleBackToCart = () => {
        setCheckoutStep('cart');
    };

    const handlePayment = () => {
        alert('Payment successful! (Demo mode)');
        setIsOpen(false);
        setCheckoutStep('cart');
    };

    return (
        <>
            {/* Overlay with fade animation */}
            <div
                className="fixed inset-0 z-50"
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar with slide animation */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto animate-slide-in">
                <div className="p-4 border-b sticky top-0 bg-white flex justify-between items-center">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        <ShoppingBag size={20} />
                        {t.cart}
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded transition-transform hover:scale-110"
                    >
                        <X size={24} />
                    </button>
                </div>

                {checkoutStep === 'cart' ? (
                    // Cart View
                    <div className="p-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-10 animate-fade-in">
                                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className={`text-gray-500 mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {t.emptyCart}
                                </p>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`px-4 py-2 bg-[#005E7B] text-white rounded-lg hover:bg-[#004b63] transition-colors ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                                >
                                    {t.continueShopping}
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items with stagger animation */}
                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                    {cart.map((item, index) => (
                                        <div
                                            key={item._id}
                                            className="flex gap-3 border-b pb-3 animate-slide-up"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            {/* Product Image */}
                                            <img
                                                src={item.image?.replace('/upload/', '/upload/f_auto,q_auto,w_100/') || 'https://via.placeholder.com/100'}
                                                alt={item.nameEn}
                                                className="w-20 h-20 object-cover rounded"
                                            />

                                            {/* Product Info */}
                                            <div className="flex-1">
                                                <h3 className="font-khmer text-sm mb-1 line-clamp-1">{item.nameKm}</h3>
                                                <p className="font-sans text-xs text-gray-600 mb-2 line-clamp-1">{item.nameEn}</p>

                                                {/* Price */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    {item.salePrice ? (
                                                        <>
                                                            <span className="font-sans text-sm font-bold text-red-600">
                                                                ${item.salePrice}
                                                            </span>
                                                            <span className="font-sans text-xs text-gray-400 line-through">
                                                                ${item.price}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-sans text-sm font-bold">
                                                            ${item.price}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 border rounded">
                                                        <button
                                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                            className="p-1 hover:bg-gray-100 rounded-l w-7 flex justify-center transition-colors"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center font-sans text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                            className="p-1 hover:bg-gray-100 rounded-r w-7 flex justify-center transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors hover:scale-110"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cart Summary */}
                                <div className="border-t pt-4 sticky bottom-0 bg-white">
                                    <div className="flex justify-between mb-2">
                                        <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                            {t.total} Items:
                                        </span>
                                        <span className="font-sans font-bold">{getItemCount()}</span>
                                    </div>
                                    <div className="flex justify-between mb-4">
                                        <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-lg`}>
                                            {t.total}:
                                        </span>
                                        <span className="font-sans text-xl font-bold text-gray-800">
                                            ${getCartTotal().toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        onClick={handleCheckout}
                                        className={`w-full bg-[#005E7B] text-white py-3 rounded-lg hover:bg-[#004b63] mb-2 transition-all hover:scale-[1.02] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                                    >
                                        {t.checkout}
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className={`w-full border-2 border-[#005E7B] text-[#005E7B] py-2 rounded-lg hover:bg-[#005E7B] hover:text-white transition-all text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                                    >
                                        {t.continueShopping}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // Payment View (Static)
                    <div className="p-4 animate-fade-in">
                        <button
                            onClick={handleBackToCart}
                            className={`flex items-center gap-2 text-blue-600 mb-4 hover:gap-3 transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                        >
                            ← {t.back}
                        </button>

                        <h3 className={`text-lg font-bold mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            Payment Details
                        </h3>

                        {/* Order Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className={`font-bold mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                Order Summary
                            </h4>
                            {cart.map(item => (
                                <div key={item._id} className="flex justify-between text-sm mb-2">
                                    <span className="font-sans">
                                        {item.nameEn} x {item.quantity}
                                    </span>
                                    <span className="font-sans">
                                        ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                                <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {t.total}:
                                </span>
                                <span className="font-sans">${getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Bakong KHQR (Static) */}
                        <div className="border rounded-lg p-4 mb-6">
                            <h4 className={`font-bold mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                Bakong KHQR
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 border rounded bg-blue-50">
                                    <input type="radio" name="payment" checked readOnly />
                                    <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        Bakong KHQR (Demo)
                                    </span>
                                </div>
                                <p className={`text-sm text-gray-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    This is a static payment demo. No actual payment will be processed.
                                </p>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            className={`w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all hover:scale-[1.02] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                        >
                            Pay ${getCartTotal().toFixed(2)} (Demo)
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
