import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
    const [statusMessage, setStatusMessage] = useState('');
    const BAKONG_LOGO_URL = 'https://bakong.nbc.gov.kh/images/favicon.png';
    const MIN_POLL_INTERVAL_MS = 6000;
    const ERROR_POLL_INTERVAL_MS = 15000;

    const API_URL = import.meta.env.VITE_API_URL
        ? (import.meta.env.VITE_API_URL.endsWith('/')
            ? import.meta.env.VITE_API_URL.slice(0, -1)
            : import.meta.env.VITE_API_URL)
        : (import.meta.env.DEV ? 'http://localhost:5000/api' : `${window.location.origin}/api`);

    // Fetch order details
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`${API_URL}/orders/${id}`);
                const data = await response.json();
                if (data.success) {
                    setPayment(data.order);

                    if (data.order.qrExpiresAt) {
                        const secondsRemaining = Math.max(
                            0,
                            Math.floor((new Date(data.order.qrExpiresAt).getTime() - Date.now()) / 1000)
                        );
                        setTimeLeft(secondsRemaining);
                        if (secondsRemaining === 0) {
                            setPaymentStatus('expired');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, API_URL]);

    // Check payment status with adaptive interval to avoid upstream rate blocking
    useEffect(() => {
        if (paymentStatus === 'paid' || paymentStatus === 'expired') {
            return;
        }

        let isCancelled = false;
        let timeoutId;

        const checkPayment = async () => {
            let nextDelayMs = MIN_POLL_INTERVAL_MS;
            try {
                const response = await fetch(`${API_URL}/orders/${id}/check-payment`);
                const data = await response.json();

                if (data.status === 'paid') {
                    setPaymentStatus('paid');
                    setStatusMessage('');
                    clearCart();
                    isCancelled = true;
                    setTimeout(() => navigate(`/order-success/${id}`), 2000);
                } else if (data.status === 'pending') {
                    setPaymentStatus('pending');
                    setStatusMessage(data.message || '');
                    nextDelayMs = Math.max(
                        MIN_POLL_INTERVAL_MS,
                        Number(data.retryAfterMs) || MIN_POLL_INTERVAL_MS
                    );
                } else if (data.status === 'error') {
                    console.error('Payment check error:', data.message);
                    setPaymentStatus('pending');
                    setStatusMessage(data.message || 'Payment verification is temporarily unavailable. Retrying...');
                    nextDelayMs = Math.max(
                        ERROR_POLL_INTERVAL_MS,
                        Number(data.retryAfterMs) || ERROR_POLL_INTERVAL_MS
                    );
                } else if (data.status === 'expired') {
                    setPaymentStatus('expired');
                    setStatusMessage('');
                    isCancelled = true;
                    console.warn('QR code expired');
                } else {
                    // Unknown status - keep polling with safe delay
                    setPaymentStatus('pending');
                    setStatusMessage('Waiting for payment confirmation...');
                    nextDelayMs = ERROR_POLL_INTERVAL_MS;
                }
            } catch (error) {
                console.error('Error checking payment:', error);
                setPaymentStatus('pending');
                setStatusMessage('Cannot reach payment server. Retrying...');
                nextDelayMs = ERROR_POLL_INTERVAL_MS;
            }

            if (!isCancelled) {
                timeoutId = setTimeout(checkPayment, nextDelayMs);
            }
        };

        checkPayment();
        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [id, navigate, paymentStatus, API_URL, clearCart]);

    // Countdown timer
    useEffect(() => {
        if (paymentStatus !== 'pending') {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [paymentStatus]);

    useEffect(() => {
        if (timeLeft === 0 && paymentStatus === 'pending') {
            setPaymentStatus('expired');
        }
    }, [timeLeft, paymentStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005E7B]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-[#005E7B] px-5 sm:px-8 py-5 sm:py-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                    <button
                        onClick={() => navigate('/')}
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-xl font-bold font-sans">Payment</h1>
                    <p className="text-white/80 text-xs sm:text-sm font-sans">Pay with Bakong KHQR</p>
                </div>

                <div className="p-4 sm:p-8 text-center">
                    {paymentStatus === 'paid' ? (
                        <div className="py-8">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-100 animate-bounce">
                                <CheckCircle size={48} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-green-600 font-sans">Payment Successful!</h2>
                            <p className="text-gray-500 font-sans text-sm">Redirecting to order confirmation...</p>
                        </div>
                    ) : paymentStatus === 'expired' ? (
                        <div className="py-8 text-center">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-red-600 font-sans">QR Expired</h2>
                            <p className="text-gray-500 font-sans text-sm">This QR code has expired. Please create a new order.</p>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="mt-6 px-6 py-2 bg-[#005E7B] text-white rounded-lg font-bold font-sans hover:bg-[#004a63] transition-colors"
                            >
                                Place New Order
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                                    <Clock size={32} className="text-[#005E7B] animate-pulse" />
                                </div>
                                <h1 className="text-2xl font-bold mb-1 font-sans">Pay with Bakong KHQR</h1>
                                <p className="text-gray-500 font-sans text-sm">Scan using any bank app in Cambodia</p>
                            </div>

                            {/* Order Info Card */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 shadow-sm">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Order Number</p>
                                    <p className="text-sm font-bold text-gray-700 font-sans break-all">{payment?.orderNumber}</p>
                                </div>
                                <div className="bg-[#005E7B]/5 rounded-2xl p-4 text-left border border-[#005E7B]/10 shadow-sm">
                                    <p className="text-[10px] text-[#005E7B] uppercase tracking-wider font-bold mb-1">Amount to Pay</p>
                                    <p className="text-lg font-bold text-[#005E7B] font-sans">${payment?.total?.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* QR Code Section */}
                            <div className="relative mb-8 group">
                                <div className="absolute inset-0 bg-[#005E7B]/5 blur-2xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                {payment?.qrImage ? (
                                    <div className="relative bg-white border-2 border-[#005E7B]/20 rounded-3xl p-3 sm:p-6 shadow-2xl inline-block w-full max-w-[340px] sm:max-w-[360px]">
                                        <div className="relative mx-auto w-[min(78vw,260px)] sm:w-[280px]">
                                            <img
                                                src={payment.qrImage}
                                                alt="Bakong KHQR"
                                                className="w-full aspect-square object-contain rounded-lg"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
                                                    <img src={BAKONG_LOGO_URL} alt="Bakong Logo" className="w-7 h-7 sm:w-10 sm:h-10 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 py-1.5 px-3 bg-red-50 text-red-600 rounded-full border border-red-100">
                                            <span className="text-[10px] font-bold font-sans">Valid for:</span>
                                            <span className="text-xs font-bold font-sans">
                                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-[min(78vw,260px)] h-[min(78vw,260px)] sm:w-64 sm:h-64 mx-auto bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                                        <div className="animate-pulse text-gray-300 font-sans text-sm">Generating QR...</div>
                                    </div>
                                )}
                            </div>

                            {/* Instruction List */}
                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-8 text-left border border-gray-100">
                                <h3 className="font-bold text-sm mb-4 font-sans text-gray-700 border-b border-gray-200 pb-2">Payment Steps</h3>
                                <ul className="space-y-3 text-xs sm:text-sm text-gray-600 font-sans">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 bg-[#005E7B] text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                                        <span>Open your bank app on your phone</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 bg-[#005E7B] text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                                        <span>Scan the QR code above to make payment</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 bg-[#005E7B] text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                                        <span>Wait for automatic payment confirmation</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Status Footer */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-3 py-2 px-4 sm:px-6 bg-blue-50 border border-blue-100 rounded-full shadow-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#005E7B]"></div>
                                    <span className="text-xs font-bold text-[#005E7B] font-sans">Waiting for payment confirmation...</span>
                                </div>
                                {statusMessage && (
                                    <p className="text-[11px] text-amber-600 font-sans text-center px-3">{statusMessage}</p>
                                )}
                                <p className="text-[10px] text-gray-400 font-sans italic">Connecting to Bakong secure network</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Support Message */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 font-sans">Having trouble with payment? <span className="text-[#005E7B] font-bold cursor-pointer hover:underline">Contact us</span></p>
            </div>
        </div>
    );
};

export default PaymentPage;



