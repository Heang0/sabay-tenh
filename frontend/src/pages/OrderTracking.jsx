import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById } from '../services/api';
import { CheckCircle, Clock, ArrowLeft, Package, Truck, CreditCard, ShoppingBag, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const statuses = [
        { id: 'pending', labelEn: 'Ordered', labelKm: 'បានកុម្ម៉ង់', icon: ShoppingBag },
        { id: 'paid', labelEn: 'Paid', labelKm: 'បានបង់ប្រាក់', icon: CreditCard },
        { id: 'processing', labelEn: 'Processing', labelKm: 'កំពុងរៀបចំ', icon: Package },
        { id: 'shipped', labelEn: 'Shipped', labelKm: 'កំពុងដឹកជញ្ជូន', icon: Truck },
        { id: 'delivered', labelEn: 'Delivered', labelKm: 'បានប្រគល់ជូន', icon: MapPin },
    ];

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const data = await fetchOrderById(id);
                setOrder(data.order || data);
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id]);

    const getCurrentStep = () => {
        if (!order) return 0;
        const status = order.orderStatus?.toLowerCase() || 'pending';
        const paymentStatus = order.paymentStatus?.toLowerCase() || 'unpaid';

        if (status === 'delivered') return 4;
        if (status === 'shipped') return 3;
        if (status === 'processing') return 2;
        if (paymentStatus === 'paid') return 1;
        return 0;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005E7B]"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-24">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-medium text-gray-800 mb-2">Order Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 bg-[#005E7B] text-white rounded-lg hover:bg-[#004b63] transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const currentStep = getCurrentStep();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-4 pt-4 pb-12"
        >
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-500 hover:text-[#005E7B] mb-8 group"
            >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back to Shop</span>
            </button>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="p-6 sm:p-8 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-[#005E7B] uppercase tracking-wider mb-1">Tracking Order</p>
                            <h1 className="text-2xl font-bold font-sans text-gray-900">#{order.orderNumber}</h1>
                        </div>
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full flex items-center gap-2 border border-green-100">
                            <CheckCircle size={16} />
                            <span className="text-sm font-bold capitalize">{order.orderStatus}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Section */}
                <div className="p-6 sm:p-10">
                    <div className="relative flex justify-between">
                        {/* Background Line */}
                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full" />

                        {/* Active Progress Line */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }}
                            className="absolute top-5 left-0 h-1 bg-[#005E7B] rounded-full z-10 transition-all duration-1000"
                        />

                        {statuses.map((status, index) => {
                            const Icon = status.icon;
                            const isActive = index <= currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div key={status.id} className="relative z-20 flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm
                                        ${isActive ? 'bg-[#005E7B] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className={`text-[10px] sm:text-xs font-bold whitespace-nowrap
                                            ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {status.labelEn}
                                        </p>
                                        <p className={`text-[9px] font-khmer font-medium mt-0.5 whitespace-nowrap
                                            ${isActive ? 'text-gray-600' : 'text-gray-300'}`}>
                                            {status.labelKm}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Details Grid */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-50">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Order Date</p>
                                <p className="text-sm font-medium text-gray-800">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400">
                                <CreditCard size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Amount</p>
                                <p className="text-sm font-bold text-[#005E7B]">${order.total?.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment CTA for unpaid orders */}
                    {order.paymentStatus !== 'paid' && (
                        <div className="mt-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                            <h3 className="text-sm font-bold text-blue-900 mb-2">Complete Payment</h3>
                            <p className="text-xs text-blue-700 mb-4">You can pay with ABA Pay for instant processing.</p>
                            <a
                                href={`https://link.payway.com.kh/ABAPAYdj419233l?amount=${order.total}&orderId=${order.orderNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#005E7B] text-white px-8 py-3 rounded-lg text-sm font-bold hover:shadow-lg transition-all active:scale-95"
                            >
                                <CreditCard size={18} />
                                Pay with ABA Now
                            </a>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-900 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Transaction Trace Verified • Secure SSL</p>
                </div>
            </div>
        </motion.div>
    );
};

export default OrderTracking;
