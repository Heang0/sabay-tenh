import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/api';
import CloudinaryUpload from '../../components/CloudinaryUpload';

const AddProduct = () => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [formData, setFormData] = useState({
        nameKm: '',
        nameEn: '',
        price: '',
        salePrice: '',
        onSale: false,
        image: '',
        category: '',
        description: '',
        inStock: true
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const API_URL = import.meta.env.DEV
        ? 'http://localhost:5000/api'
        : 'https://sabay-tenh.onrender.com/api'; 

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/categories`);
                const data = await response.json();
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, category: data[0]._id }));
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Validate required fields
            if (!formData.nameKm || !formData.nameEn || !formData.price || !formData.image || !formData.category) {
                setMessage({ type: 'error', text: 'Please fill all required fields' });
                setLoading(false);
                return;
            }

            const productData = {
                nameKm: formData.nameKm,
                nameEn: formData.nameEn,
                price: parseFloat(formData.price),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                onSale: formData.onSale || false,
                image: formData.image,
                category: formData.category,
                description: formData.description || '',
                inStock: formData.inStock
            };

            console.log('Sending product data:', productData); // Debug log

            const result = await createProduct(productData);
            console.log('Product created:', result); // Debug log

            setMessage({ type: 'success', text: 'Product added successfully!' });

            // Reset form
            setFormData({
                nameKm: '', nameEn: '', price: '', salePrice: '',
                onSale: false, image: '', category: categories[0]?._id || '',
                description: '', inStock: true
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);

        } catch (error) {
            console.error('Error creating product:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to add product. Check console.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingCategories) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 font-khmer">បន្ថែមផលិតផលថ្មី</h2>
            <p className="text-gray-600 mb-6 font-sans">Add New Product</p>

            {message && (
                <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Khmer Name */}
                <div>
                    <label className="block font-khmer mb-1">ឈ្មោះជាភាសាខ្មែរ <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="nameKm"
                        value={formData.nameKm}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* English Name */}
                <div>
                    <label className="block font-sans mb-1">English Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="nameEn"
                        value={formData.nameEn}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block font-sans mb-1">Price ($) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Sale Price & On Sale Checkbox */}
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block font-sans mb-1">Sale Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="salePrice"
                            value={formData.salePrice}
                            onChange={handleChange}
                            disabled={!formData.onSale}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center mt-6">
                        <input
                            type="checkbox"
                            name="onSale"
                            checked={formData.onSale}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label className="font-sans">On Sale</label>
                    </div>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block font-sans mb-1">Product Image <span className="text-red-500">*</span></label>
                    <CloudinaryUpload
                        onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        value={formData.image}
                        onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                    />
                </div>

                {/* Category Dropdown */}
                <div>
                    <label className="block font-sans mb-1">Category <span className="text-red-500">*</span></label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.nameEn} ({cat.nameKm})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block font-sans mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* In Stock */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label className="font-sans">In Stock</label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-sans"
                >
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;