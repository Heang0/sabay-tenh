import { useState, useEffect } from 'react';
import { Eye, Truck, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const API_URL = import.meta.env.DEV
        ? 'http://localhost:5000/api'
        : 'https://sabay-tenh.onrender.com/api'; // Hardcode for production

    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId, status) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderStatus: status })
            });

            if (response.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const updatePaymentStatus = async (orderId, status) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ paymentStatus: status })
            });

            if (response.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2 font-khmer">គ្រប់គ្រងការបញ្ជាទិញ</h2>
                    <p className="text-gray-600 font-sans">Orders Management</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Paid</span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.map(order => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-sans text-sm font-medium">{order.orderNumber}</td>
                                <td className="px-4 py-3">
                                    <div className="font-sans text-sm">{order.customer?.fullName}</div>
                                    <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                                </td>
                                <td className="px-4 py-3 font-sans text-sm font-medium">${order.total?.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <select
                                            value={order.paymentStatus || 'pending'}
                                            onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded font-sans border-0 cursor-pointer ${getPaymentStatusColor(order.paymentStatus || 'pending')}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        className={`text-xs px-2 py-1 rounded font-sans border-0 cursor-pointer ${getStatusColor(order.orderStatus)}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 font-sans text-xs text-gray-500">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold font-sans">Order Details</h3>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Order Number & Status */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Order Number</p>
                                        <p className="font-sans font-medium text-lg">{selectedOrder.orderNumber}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-2 py-1 rounded font-sans ${getPaymentStatusColor(selectedOrder.paymentStatus || 'pending')}`}>
                                            {selectedOrder.paymentStatus || 'pending'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded font-sans ${getStatusColor(selectedOrder.orderStatus)}`}>
                                            {selectedOrder.orderStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">Customer Information</p>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="font-sans font-medium">{selectedOrder.customer?.fullName}</p>
                                        <p className="font-sans text-sm text-gray-600">{selectedOrder.customer?.phone}</p>
                                        <p className="font-sans text-sm text-gray-600">{selectedOrder.customer?.address}</p>
                                        {selectedOrder.customer?.email && (
                                            <p className="font-sans text-sm text-gray-600">{selectedOrder.customer.email}</p>
                                        )}
                                        {selectedOrder.customer?.note && (
                                            <p className="font-sans text-sm text-gray-600 mt-2 italic">
                                                Note: {selectedOrder.customer.note}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">Items</p>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 bg-gray-50 p-2 rounded-lg">
                                                <img
                                                    src={item.image?.replace('/upload/', '/upload/f_auto,q_auto,w_80/') || 'https://via.placeholder.com/80'}
                                                    alt={item.nameEn}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-khmer text-sm">{item.nameKm}</p>
                                                    <p className="font-sans text-xs text-gray-500">{item.nameEn}</p>
                                                    <div className="flex justify-between mt-1">
                                                        <p className="font-sans text-xs">Qty: {item.quantity}</p>
                                                        <p className="font-sans text-sm font-medium">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="border-t pt-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-sans">Subtotal</span>
                                            <span className="font-sans">${selectedOrder.subtotal?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-sans">Shipping</span>
                                            <span className="font-sans text-green-600">Free</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t">
                                            <span className="font-sans">Total</span>
                                            <span className="font-sans text-[#005E7B]">${selectedOrder.total?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full mt-6 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-colors font-sans text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;