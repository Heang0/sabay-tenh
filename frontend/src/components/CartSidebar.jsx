import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const CartSidebar = () => {
    const {
        cart,
        isOpen,
        setIsOpen,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getItemCount
    } = useCart();

    const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, payment

    if (!isOpen) return null;

    const handleCheckout = () => {
        setCheckoutStep('payment');
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
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto">
                <div className="p-4 border-b sticky top-0 bg-white flex justify-between items-center">
                    <h2 className="text-xl font-bold font-khmer flex items-center gap-2">
                        <ShoppingBag size={20} />
                        កន្ត្រកទំនិញ
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>

                {checkoutStep === 'cart' ? (
                    // Cart View
                    <div className="p-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-10">
                                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-sans mb-4">Your cart is empty</p>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items */}
                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item._id} className="flex gap-3 border-b pb-3">
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
                                                            className="p-1 hover:bg-gray-100 rounded-l w-7 flex justify-center"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center font-sans text-sm">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                            className="p-1 hover:bg-gray-100 rounded-r w-7 flex justify-center"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="text-red-500 hover:text-red-700"
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
                                        <span className="font-sans">Total Items:</span>
                                        <span className="font-sans font-bold">{getItemCount()}</span>
                                    </div>
                                    <div className="flex justify-between mb-4">
                                        <span className="font-sans text-lg">Total:</span>
                                        <span className="font-sans text-xl font-bold text-blue-600">
                                            ${getCartTotal().toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-sans mb-2"
                                    >
                                        Proceed to Checkout
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-full border py-2 rounded-lg hover:bg-gray-50 font-sans"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // Payment View (Static)
                    <div className="p-4">
                        <button
                            onClick={handleBackToCart}
                            className="flex items-center gap-2 text-blue-600 mb-4 font-sans"
                        >
                            ← Back to Cart
                        </button>

                        <h3 className="text-lg font-bold mb-4 font-sans">Payment Details</h3>

                        {/* Order Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="font-bold mb-2 font-sans">Order Summary</h4>
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
                                <span className="font-sans">Total:</span>
                                <span className="font-sans">${getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        {/* ABA Payway (Static) */}
                        <div className="border rounded-lg p-4 mb-6">
                            <h4 className="font-bold mb-3 font-sans">ABA Payway</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 border rounded bg-blue-50">
                                    <input type="radio" name="payment" checked readOnly />
                                    <span className="font-sans">ABA Payway (Demo)</span>
                                </div>
                                <p className="text-sm text-gray-600 font-sans">
                                    This is a static payment demo. No actual payment will be processed.
                                </p>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-sans"
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