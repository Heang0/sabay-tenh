import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import {
    Mail, LogOut, Package, Clock, ChevronRight,
    ArrowLeft, ShoppingBag, User, CheckCircle, Heart
} from 'lucide-react';

const API_URL = import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://sabay-tenh.onrender.com/api';

const STATUS_MAP = {
    pending: { cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
    processing: { cls: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
    shipped: { cls: 'bg-violet-100 text-violet-700', dot: 'bg-violet-400' },
    delivered: { cls: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
    cancelled: { cls: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
    paid: { cls: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
    failed: { cls: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
};

const Badge = ({ status }) => {
    const s = STATUS_MAP[status] || { cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.cls} ${status && status.length > 0 && typeof status === 'string' && (status.match(/[\u1780-\u17FF]/) || (typeof km !== 'undefined' && km)) ? 'font-khmer' : ''}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
        </span>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const { user, firebaseUser, logout, isLoggedIn, getToken } = useUser();
    const { language } = useLanguage();
    const km = language === 'km';

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [tab, setTab] = useState('orders');

    useEffect(() => {
        if (!isLoggedIn) { navigate('/user-login'); return; }
        loadOrders();
    }, [isLoggedIn]);

    const loadOrders = async () => {
        try {
            setLoadingOrders(true);
            const token = await getToken();
            const res = await fetch(`${API_URL}/users/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (e) {
            console.error('Orders error:', e);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    const name = user.displayName || firebaseUser?.displayName || 'User';
    const email = user.email || firebaseUser?.email || '';
    const avatar = firebaseUser?.photoURL;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
    const delivered = orders.filter(o => o.orderStatus === 'delivered').length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-2xl mx-auto h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all border border-gray-100 active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={`text-lg font-bold text-gray-900 leading-tight ${km ? 'font-khmer' : 'font-sans'}`}>
                                {km ? 'គណនី' : 'My Account'}
                            </h1>
                            <p className={`text-xs text-gray-400 font-medium ${km ? 'font-khmer' : 'font-sans'}`}>
                                {km ? 'គ្រប់គ្រងព័ត៌មានរបស់អ្នក' : 'Manage your profile'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold py-2 px-4 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all active:scale-95"
                    >
                        <LogOut size={16} />
                        <span className={km ? 'font-khmer' : ''}>{km ? 'ចាកចេញ' : 'Sign out'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full py-4 space-y-4">

                {/* ── Profile card ── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Gradient top strip */}
                    <div className="h-16 bg-gradient-to-r from-[#005E7B] to-teal-400" />

                    <div className="px-4 pb-4">
                        {/* Avatar offset */}
                        <div className="flex items-end justify-between -mt-8 mb-3">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="avatar"
                                    referrerPolicy="no-referrer"
                                    className="w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-[#005E7B] to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                                    {initials}
                                </div>
                            )}
                        </div>

                        <h2 className={`text-lg font-bold text-gray-900 leading-tight ${km ? 'font-khmer' : ''}`}>{name}</h2>
                        <p className="text-sm text-gray-400 mt-0.5 break-all">{email}</p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {[
                                { label: km ? 'ការបញ្ជាទិញ' : 'Orders', value: orders.length },
                                { label: km ? 'សរុបចំណាយ' : 'Spent', value: `$${totalSpent.toFixed(0)}` },
                                { label: km ? 'បានទទួល' : 'Delivered', value: delivered },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-[#005E7B]">{value}</p>
                                    <p className={`text-[10px] text-gray-500 mt-0.5 leading-tight ${km ? 'font-khmer' : ''}`}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Tab bar ── */}
                <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
                    {[
                        { key: 'orders', icon: Package, label: km ? 'ការបញ្ជាទិញ' : 'Orders' },
                        { key: 'account', icon: User, label: km ? 'គណនី' : 'Account' },
                    ].map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === key
                                ? 'bg-gradient-to-r from-[#005E7B] to-teal-500 text-white shadow'
                                : 'text-gray-400 hover:text-gray-600'
                                } ${km ? 'font-khmer' : ''}`}
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── ORDERS TAB ── */}
                {tab === 'orders' && (
                    <div className="space-y-3 pb-6">
                        {loadingOrders ? (
                            <div className="bg-white rounded-2xl p-12 flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-[#005E7B] border-t-transparent rounded-full animate-spin" />
                                <p className={`text-sm text-gray-400 ${km ? 'font-khmer' : ''}`}>{km ? 'កំពុងផ្ទុក...' : 'Loading...'}</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                                    <ShoppingBag size={24} className="text-gray-300" />
                                </div>
                                <p className={`text-gray-600 font-semibold ${km ? 'font-khmer' : ''}`}>
                                    {km ? 'មិនទាន់មានការបញ្ជាទិញ' : 'No orders yet'}
                                </p>
                                <p className={`text-gray-400 text-sm ${km ? 'font-khmer' : ''}`}>
                                    {km ? 'ការបញ្ជាទិញរបស់អ្នកនឹងបង្ហាញនៅទីនេះ' : 'Your orders will appear here.'}
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className={`mt-1 px-5 py-2 bg-[#005E7B] text-white rounded-xl text-sm font-semibold ${km ? 'font-khmer' : ''}`}
                                >
                                    {km ? 'ចាប់ផ្តើមទិញ' : 'Start Shopping'}
                                </button>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => navigate(`/order-tracking/${order.id}`)}
                                    className="bg-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    {/* Order top row */}
                                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 flex-shrink-0 bg-[#005E7B]/10 rounded-lg flex items-center justify-center">
                                                <Package size={14} className="text-[#005E7B]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 font-mono truncate">{order.orderNumber}</p>
                                                <p className={`text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 ${km ? 'font-khmer' : ''}`}>
                                                    <Clock size={10} />
                                                    {new Date(order.createdAt).toLocaleDateString(km ? 'km-KH' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                                    </div>

                                    {/* Order bottom row */}
                                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                                        {/* Item preview images */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="flex -space-x-2 flex-shrink-0">
                                                {order.items?.slice(0, 3).map((item, i) => (
                                                    <img
                                                        key={i}
                                                        src={item.image?.replace('/upload/', '/upload/f_auto,q_auto,w_60/') || 'https://via.placeholder.com/60'}
                                                        alt=""
                                                        className="w-8 h-8 rounded-lg border-2 border-white object-cover"
                                                    />
                                                ))}
                                                {order.items?.length > 3 && (
                                                    <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-medium">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1 min-w-0">
                                                <Badge status={order.orderStatus} />
                                                <Badge status={order.paymentStatus} />
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-[#005E7B] flex-shrink-0">${Number(order.total).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── ACCOUNT TAB ── */}
                {tab === 'account' && (
                    <div className="space-y-3 pb-6">
                        {/* Info card */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                            <div className="px-4 py-3">
                                <p className={`text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ${km ? 'font-khmer' : ''}`}>
                                    {km ? 'ព័ត៌មានគណនី' : 'Account Info'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <User size={15} className="text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-[11px] text-gray-400 ${km ? 'font-khmer' : ''}`}>{km ? 'ឈ្មោះ' : 'Name'}</p>
                                    <p className={`text-sm font-semibold text-gray-800 truncate ${km ? 'font-khmer' : ''}`}>{name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3.5">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                                    <Mail size={15} className="text-teal-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-gray-400">Email</p>
                                    <p className="text-sm font-semibold text-gray-800 break-all">{email}</p>
                                </div>
                            </div>
                            {avatar && (
                                <div className="flex items-center gap-3 px-4 py-3.5">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle size={15} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className={`text-[11px] text-gray-400 ${km ? 'font-khmer' : ''}`}>{km ? 'ប្រភេទចូល' : 'Sign-in method'}</p>
                                        <p className="text-sm font-semibold text-gray-800">Google</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action links */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                            <button
                                onClick={() => setTab('orders')}
                                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                    <Package size={15} className="text-orange-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold text-gray-800 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'ការបញ្ជាទិញរបស់ខ្ញុំ' : 'My Orders'}
                                    </p>
                                    <p className={`text-xs text-gray-400 ${km ? 'font-khmer' : ''}`}>{orders.length} {km ? 'ការបញ្ជាទិញ' : 'total'}</p>
                                </div>
                                <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
                            </button>
                            <button
                                onClick={() => navigate('/wishlist')}
                                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <Heart size={15} className="text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold text-gray-800 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'បញ្ជីចង់បាន' : 'Wishlist'}
                                    </p>
                                    <p className={`text-xs text-gray-400 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'ផលិតផលដែលខ្ញុំចង់បាន' : 'Products you saved'}
                                    </p>
                                </div>
                                <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag size={15} className="text-purple-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold text-gray-800 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'ទំនិញ' : 'Continue Shopping'}
                                    </p>
                                    <p className={`text-xs text-gray-400 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'រកទំនិញថ្មី' : 'Browse our catalogue'}
                                    </p>
                                </div>
                                <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
                            </button>
                        </div>

                        {/* Sign out */}
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 bg-white text-red-500 hover:bg-red-50 transition-colors text-sm font-semibold ${km ? 'font-khmer' : ''}`}
                        >
                            <LogOut size={15} />
                            {km ? 'ចាកចេញពីគណនី' : 'Sign out'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
