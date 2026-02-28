import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { fetchCoupons, createCoupon, deleteCoupon, updateCoupon } from '../../services/api';
import { ArrowLeft, Plus, Trash2, Tag, ToggleLeft, ToggleRight, Edit2, X } from 'lucide-react';

const CouponManagement = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: ''
    });

    useEffect(() => { loadCoupons(); }, []);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const data = await fetchCoupons();
            setCoupons(data.coupons || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                value: Number(formData.value),
                minOrder: formData.minOrder ? Number(formData.minOrder) : 0,
                maxUses: formData.maxUses ? Number(formData.maxUses) : null,
                expiresAt: formData.expiresAt || null
            };

            if (editingId) {
                await updateCoupon(editingId, payload);
            } else {
                await createCoupon(payload);
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '' });
            loadCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.minOrder || '',
            maxUses: coupon.maxUses || '',
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : ''
        });
        setEditingId(coupon._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this coupon?')) {
            await deleteCoupon(id);
            loadCoupons();
        }
    };

    const handleToggle = async (coupon) => {
        await updateCoupon(coupon._id, { isActive: !coupon.isActive });
        loadCoupons();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 font-sans">Coupon Management</h1>
                    </div>
                    <button
                        onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '' }); }}
                        className="flex items-center gap-1 px-4 py-2 bg-[#005E7B] text-white rounded-lg text-sm hover:bg-[#004b63]"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'Add Coupon'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm mb-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Code</label>
                                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-sans uppercase" placeholder="SUMMER20" required disabled={!!editingId} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Type</label>
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-sans">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ($)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Value</label>
                                <input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-sans" placeholder={formData.type === 'percentage' ? '20' : '5.00'} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Min Order ($)</label>
                                <input type="number" value={formData.minOrder} onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-sans" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Max Uses</label>
                                <input type="number" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-sans" placeholder="Unlimited" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Expires</label>
                                <input type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-sans" />
                            </div>
                        </div>
                        <button type="submit" className="px-5 py-2 bg-[#005E7B] text-white rounded-lg text-sm hover:bg-[#004b63] font-sans">
                            {editingId ? 'Update Coupon' : 'Create Coupon'}
                        </button>
                    </form>
                )}

                {/* Coupons List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-[#005E7B] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <Tag size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-sans">No coupons yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {coupons.map(coupon => (
                            <div key={coupon._id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${coupon.isActive ? 'border-green-500' : 'border-gray-300'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg font-bold text-gray-800">{coupon.code}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-sans mt-1">
                                            {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`}
                                            {coupon.minOrder > 0 && ` • Min order: $${coupon.minOrder}`}
                                            {coupon.maxUses && ` • Used: ${coupon.usedCount}/${coupon.maxUses}`}
                                            {coupon.expiresAt && ` • Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggle(coupon)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            {coupon.isActive ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                                        </button>
                                        <button onClick={() => handleEdit(coupon)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(coupon._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponManagement;
