import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../services/api';
import { Edit, Trash2, Plus } from 'lucide-react';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const navigate = useNavigate();

    // Load products
    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Handle delete
    const handleDelete = async (id, nameKm) => {
        if (!window.confirm(`Are you sure you want to delete "${nameKm}"?`)) {
            return;
        }

        try {
            setDeleteLoading(id);
            await deleteProduct(id);
            // Remove from list
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
                    onClick={loadProducts}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-khmer">បញ្ជីផលិតផល</h2>
                    <p className="text-gray-600 font-sans">Product List</p>
                </div>
                <button
                    onClick={() => navigate('/admin/add-product')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Plus size={20} />
                    <span className="font-sans">Add New</span>
                </button>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-600 font-sans">No products found.</p>
                    <button
                        onClick={() => navigate('/admin/add-product')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add Your First Product
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
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img
                                            src={product.image || 'https://via.placeholder.com/50'}
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
                                    <td className="px-4 py-3 font-sans">{product.category}</td>
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