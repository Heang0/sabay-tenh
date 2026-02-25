import { useState, useEffect } from 'react';
import { fetchProducts } from '../../services/api';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        outOfStock: 0,
        onSale: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const products = await fetchProducts();
                console.log('Fetched products:', products); // Debug log

                const totalValue = products.reduce((sum, p) => {
                    const price = p.salePrice || p.price;
                    return sum + (price || 0);
                }, 0);

                setStats({
                    totalProducts: products.length,
                    totalValue: totalValue,
                    outOfStock: products.filter(p => !p.inStock).length,
                    onSale: products.filter(p => p.onSale).length
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const cards = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: <Package className="text-blue-600" size={24} />,
            bg: 'bg-blue-100'
        },
        {
            title: 'Inventory Value',
            value: `$${stats.totalValue.toFixed(2)}`,
            icon: <DollarSign className="text-green-600" size={24} />,
            bg: 'bg-green-100'
        },
        {
            title: 'Out of Stock',
            value: stats.outOfStock,
            icon: <ShoppingBag className="text-orange-600" size={24} />,
            bg: 'bg-orange-100'
        },
        {
            title: 'On Sale',
            value: stats.onSale,
            icon: <TrendingUp className="text-purple-600" size={24} />,
            bg: 'bg-purple-100'
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 font-khmer">ផ្ទាំងគ្រប់គ្រង</h1>
            <p className="text-gray-600 mb-8 font-sans">Welcome to your admin dashboard</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className={`p-3 rounded-full ${card.bg} w-fit mb-4`}>
                            {card.icon}
                        </div>
                        <h3 className="text-gray-600 font-sans text-sm mb-1">{card.title}</h3>
                        <p className="text-2xl font-bold font-sans">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold mb-4 font-sans">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href="/admin/add-product"
                        className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <p className="font-bold font-sans">➕ Add New Product</p>
                        <p className="text-sm mt-1">Create a new product listing</p>
                    </a>
                    <a
                        href="/admin/products"
                        className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <p className="font-bold font-sans">📋 Manage Products</p>
                        <p className="text-sm mt-1">Edit or delete existing products</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;