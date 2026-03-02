import { useState, useEffect } from 'react';
import { fetchProducts } from '../../services/api';
import { Package, ShoppingBag, DollarSign, TrendingUp, ArrowUp, ArrowDown, PlusCircle, Tag } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        outOfStock: 0,
        onSale: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const products = await fetchProducts();

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

                // Get 5 most recent products
                setRecentProducts(products.slice(0, 5));
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    // Calculate real dynamic metrics
    const totalProducts = stats.totalProducts;
    const totalValue = stats.totalValue;
    const outOfStock = stats.outOfStock;
    const onSale = stats.onSale;

    // Calculate dynamic percentages
    const inStockPercentage = totalProducts > 0 ? Math.round(((totalProducts - outOfStock) / totalProducts) * 100) : 0;
    const onSalePercentage = totalProducts > 0 ? Math.round((onSale / totalProducts) * 100) : 0;
    const averagePrice = totalProducts > 0 ? (totalValue / totalProducts).toFixed(2) : 0;
    const inStockCount = totalProducts - outOfStock;

    // Dynamic cards with real data
    const cards = [
        {
            title: 'Total Products',
            value: totalProducts,
            subtext: `${inStockCount} in stock (${inStockPercentage}%)`,
            icon: <Package className="text-white" size={24} />,
            bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
            change: `${onSale} on sale`,
            trend: totalProducts > 0 ? 'up' : 'down'
        },
        {
            title: 'Inventory Value',
            value: `$${totalValue.toFixed(2)}`,
            subtext: `Avg $${averagePrice} per item`,
            icon: <DollarSign className="text-white" size={24} />,
            bg: 'bg-gradient-to-br from-green-500 to-green-600',
            change: `${totalProducts} items total`,
            trend: totalValue > 0 ? 'up' : 'down'
        },
        {
            title: 'Out of Stock',
            value: outOfStock,
            subtext: `${inStockPercentage}% in stock`,
            icon: <ShoppingBag className="text-white" size={24} />,
            bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
            change: outOfStock > 0 ? `${outOfStock} items need attention` : 'All stocked',
            trend: outOfStock > 0 ? 'down' : 'up'
        },
        {
            title: 'On Sale',
            value: onSale,
            subtext: `${onSalePercentage}% of products`,
            icon: <TrendingUp className="text-white" size={24} />,
            bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
            change: onSale > 0 ? `${onSale} items discounted` : 'No sales',
            trend: onSale > 0 ? 'up' : 'down'
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#005E7B]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 font-khmer text-gray-800">ផ្ទាំងគ្រប់គ្រង</h1>
                <p className="text-gray-500 font-sans">
                    Welcome back, Admin! Here's what's happening with your store.
                </p>
            </div>

            {/* Stats Cards - 100% Dynamic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`${card.bg} rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 text-white`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                {card.icon}
                            </div>
                            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                                {card.trend === 'up' ? (
                                    <ArrowUp size={14} className="text-green-300" />
                                ) : (
                                    <ArrowDown size={14} className="text-red-300" />
                                )}
                                <span className="text-xs">{card.change}</span>
                            </div>
                        </div>
                        <h3 className="text-white/80 text-sm font-sans mb-1">{card.title}</h3>
                        <p className="text-3xl font-bold font-sans">{card.value}</p>
                        <p className="text-white/60 text-xs font-sans mt-1">{card.subtext}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4 font-sans flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#005E7B] rounded-full"></span>
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <a
                                href="#/admin/add-product"
                                className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                            >
                                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <PlusCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold font-sans text-gray-800">Add New Product</p>
                                    <p className="text-sm text-gray-500">Create a new product listing</p>
                                </div>
                            </a>
                            <a
                                href="#/admin/products"
                                className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                            >
                                <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <Package size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold font-sans text-gray-800">Manage Products</p>
                                    <p className="text-sm text-gray-500">Edit or delete existing products</p>
                                </div>
                            </a>
                            <a
                                href="#/admin/orders"
                                className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                            >
                                <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold font-sans text-gray-800">View Orders</p>
                                    <p className="text-sm text-gray-500">Check and update order status</p>
                                </div>
                            </a>
                            <a
                                href="#/admin/coupons"
                                className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group"
                            >
                                <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <Tag size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold font-sans text-gray-800">Manage Coupons</p>
                                    <p className="text-sm text-gray-500">Create discount codes and offers</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4 font-sans flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#005E7B] rounded-full"></span>
                            Recent Products
                        </h2>
                        {recentProducts.length === 0 ? (
                            <p className="text-gray-500 font-sans text-center py-8">No products yet</p>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {recentProducts.map((product) => (
                                        <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_50/') || 'https://via.placeholder.com/50'}
                                                    alt={product.nameEn}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                                <div>
                                                    <p className="font-khmer text-sm font-medium">{product.nameKm}</p>
                                                    <p className="font-sans text-xs text-gray-500">{product.nameEn}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-sans font-bold text-[#005E7B]">${product.price}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a
                                    href="/admin/products"
                                    className="block text-center mt-4 text-sm text-[#005E7B] hover:underline font-sans"
                                >
                                    View all products →
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards - Dynamic based on real data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="font-sans font-semibold text-gray-700 mb-4">Inventory Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-gray-600">In Stock Items</span>
                            <span className="font-sans font-bold text-green-600">{inStockCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${inStockPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-gray-600">Out of Stock</span>
                            <span className="font-sans font-bold text-red-600">{outOfStock}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${100 - inStockPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="font-sans font-semibold text-gray-700 mb-4">Sales Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-gray-600">Products on Sale</span>
                            <span className="font-sans font-bold text-purple-600">{onSale}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${onSalePercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-gray-600">Regular Price Items</span>
                            <span className="font-sans font-bold text-gray-600">{totalProducts - onSale}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${100 - onSalePercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;