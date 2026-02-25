import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, updateProduct } from '../../services/api';

const EditProduct = () => {
    const { id } = useParams(); // Get product ID from URL
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
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

    const categories = [
        'furniture', 'storage', 'beauty', 'home',
        'bedding', 'sports', 'electronics', 'clothing'
    ];

    // Load product data
    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const data = await fetchProductById(id);
                setFormData({
                    nameKm: data.nameKm || '',
                    nameEn: data.nameEn || '',
                    price: data.price || '',
                    salePrice: data.salePrice || '',
                    onSale: data.onSale || false,
                    image: data.image || '',
                    category: data.category || 'furniture',
                    description: data.description || '',
                    inStock: data.inStock !== undefined ? data.inStock : true
                });
            } catch (err) {
                setError('Failed to load product');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null
            };

            await updateProduct(id, productData);
            navigate('/admin/products'); // Go back to list after save
        } catch (err) {
            setError('Failed to update product');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-khmer">កែសម្រួលផលិតផល</h2>
                    <p className="text-gray-600 font-sans">Edit Product</p>
                </div>
                <button
                    onClick={() => navigate('/admin/products')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                    Back
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
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

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-sans"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-sans"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;