import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../services/api';
import { Edit, Trash2, Plus, Search, X, Filter } from 'lucide-react';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [stockFilter, setStockFilter] = useState('all');
    const navigate = useNavigate();

    const API_URL = import.meta.env.DEV
        ? 'http://localhost:5000/api'
        : 'https://sabay-tenh.onrender.com/api';

    // Fetch categories
    const fetchCategories = async () => {
        try {
            console.log('Fetching categories from:', `${API_URL}/categories`); // Debug
            const response = await fetch(`${API_URL}/categories`);

            if (!response.ok) {
                console.log('Response status:', response.status);
                const text = await response.text();
                console.log('Response text:', text);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Categories fetched:', data);
            setCategories(data);
            return data;
        } catch (err) {
            console.error('❌ Failed to load categories:', err);
            return [];
        }
    };

    // Load products and categories together - FIXED
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load products first
                const productsData = await fetchProducts();
                setProducts(productsData);
                setFilteredProducts(productsData);

                // Then load categories separately
                const categoriesData = await fetchCategories();
                console.log('✅ Categories set in state:', categoriesData); // Debug

                setError(null);
            } catch (err) {
                setError('Failed to load data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter products when search, category, or stock filter changes
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.nameKm.toLowerCase().includes(query) ||
                p.nameEn.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Stock filter
        if (stockFilter === 'inStock') {
            filtered = filtered.filter(p => p.inStock);
        } else if (stockFilter === 'outOfStock') {
            filtered = filtered.filter(p => !p.inStock);
        }

        setFilteredProducts(filtered);
    }, [searchQuery, selectedCategory, stockFilter, products]);

    // Helper function to get category name from ID
    const getCategoryName = (categoryId) => {
        if (!categoryId) return 'Uncategorized';

        // Add debug log
        console.log('Looking for category:', categoryId, 'in', categories);

        const category = categories.find(c => c._id === categoryId);

        if (category) {
            return category.nameEn;
        } else {
            // Show partial ID for debugging
            return `Unknown (${categoryId.slice(-4)})`;
        }
    };

    // Handle delete
    const handleDelete = async (id, nameKm) => {
        if (!window.confirm(`Are you sure you want to delete "${nameKm}"?`)) {
            return;
        }

        try {
            setDeleteLoading(id);
            await deleteProduct(id);
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete product');
            console.error(err);
        } finally {
            setDeleteLoading(null);
        }
    };

    // Handle edit
    const handleEdit = (id) => {
        navigate(`/admin/edit-product/${id}`);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setStockFilter('all');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-600 font-sans">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-khmer">បញ្ជីផលិតផល</h2>
                    <p className="text-gray-600 font-sans">Product List ({filteredProducts.length} items)</p>
                </div>
                <button
                    onClick={() => navigate('/admin/add-product')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus size={20} />
                    <span className="font-sans">Add New</span>
                </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products by name or description..."
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                    <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Toggle for Mobile */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Filter size={18} />
                    <span className="font-sans">Filters</span>
                </button>

                {/* Filter Options */}
                <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4`}>
                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full lg:w-48 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.nameEn}
                            </option>
                        ))}
                    </select>

                    {/* Stock Filter */}
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-full lg:w-40 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    >
                        <option value="all">All Stock</option>
                        <option value="inStock">In Stock</option>
                        <option value="outOfStock">Out of Stock</option>
                    </select>

                    {/* Clear Filters Button */}
                    {(searchQuery || selectedCategory !== 'all' || stockFilter !== 'all') && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-sans"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-600 font-sans">No products found matching your criteria.</p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-sans text-sm font-semibold text-gray-600">Image</th>
                                <th className="px-4 py-3 text-left font-sans text-sm font-semibold text-gray-600">Khmer Name</th>
                                <th className="px-4 py-3 text-left font-sans text-sm font-semibold text-gray-600">English Name</th>
                                <th className="px-4 py-3 text-left font-sans text-sm font-semibold text-gray-600">Price</th>
                                <th className="px-4 py-3 text-left font-sans text-sm font-semibold text-gray-600">Category</th>
                                <th className="px-4 py-3 text-left font-sans text-sm font-semibold text-gray-600">Stock</th>
                                <th className="px-4 py-3 text-left font-sans text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img
                                            src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_100/') || 'https://via.placeholder.com/50'}
                                            alt={product.nameEn}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-khmer">{product.nameKm}</td>
                                    <td className="px-4 py-3 font-sans">{product.nameEn}</td>
                                    <td className="px-4 py-3 font-sans">
                                        {product.salePrice ? (
                                            <div>
                                                <span className="text-red-600 font-bold">${product.salePrice}</span>
                                                <span className="text-gray-400 line-through ml-2 text-sm">${product.price}</span>
                                            </div>
                                        ) : (
                                            <span>$ {product.price}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-sans">
                                        {getCategoryName(product.category)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-sans ${product.inStock
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(product._id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id, product.nameKm)}
                                                disabled={deleteLoading === product._id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductList;