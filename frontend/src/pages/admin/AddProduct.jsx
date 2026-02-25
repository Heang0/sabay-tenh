import { useState } from 'react';
import { createProduct } from '../../services/api';
import CloudinaryUpload from '../../components/CloudinaryUpload';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        nameKm: '',
        nameEn: '',
        price: '',
        salePrice: '',
        onSale: false,
        image: '',
        category: 'furniture',
        description: '',
        inStock: true
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const categories = [
        'furniture', 'storage', 'beauty', 'home',
        'bedding', 'sports', 'electronics', 'clothing'
    ];

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
            // Convert price strings to numbers
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null
            };

            const result = await createProduct(productData);
            setMessage({ type: 'success', text: 'Product added successfully!' });

            // Clear form
            setFormData({
                nameKm: '', nameEn: '', price: '', salePrice: '',
                onSale: false, image: '', category: 'furniture',
                description: '', inStock: true
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add product. Check console.' });
        } finally {
            setLoading(false);
        }
    };

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
                    <label className="block font-khmer mb-1">ឈ្មោះជាភាសាខ្មែរ</label>
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
                    <label className="block font-sans mb-1">English Name</label>
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
                    <label className="block font-sans mb-1">Price ($)</label>
                    <input
                        type="number"
                        step="0.01"
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
                    <label className="block font-sans mb-1">Product Image</label>
                    <CloudinaryUpload
                        onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        value={formData.image}
                        onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                    />
                    {formData.image && (
                        <p className="text-xs text-gray-500 mt-1">
                            ✓ Image uploaded successfully
                        </p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block font-sans mb-1">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
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