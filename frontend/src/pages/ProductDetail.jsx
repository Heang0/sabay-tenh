import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Heart, Minus, Plus } from 'lucide-react';
import { fetchProductById, fetchProducts } from '../services/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const productData = await fetchProductById(id);
                setProduct(productData);

                const allProducts = await fetchProducts();
                const related = allProducts
                    .filter(p => p.category === productData.category && p._id !== id)
                    .slice(0, 4);
                setRelatedProducts(related);

            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 font-sans">Product not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans text-sm"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-sans text-sm transition-colors"
            >
                <ArrowLeft size={18} />
                <span>Back</span>
            </button>

            {/* Product Main Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
                {/* Product Image */}
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <img
                        src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_800/') || 'https://via.placeholder.com/800x800'}
                        alt={product.nameEn}
                        className="w-full h-auto object-cover"
                    />
                </div>

                {/* Product Info */}
                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold font-khmer text-gray-800 mb-1">{product.nameKm}</h1>
                        <p className="text-base text-gray-500 font-sans">{product.nameEn}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        {product.salePrice ? (
                            <>
                                <span className="text-2xl font-bold text-red-600 font-sans">
                                    ${product.salePrice}
                                </span>
                                <span className="text-lg text-gray-400 line-through font-sans">
                                    ${product.price}
                                </span>
                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-sans font-medium">
                                    Save ${(product.price - product.salePrice).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-gray-800 font-sans">
                                ${product.price}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`text-sm font-sans ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="pt-2">
                        <label className="block text-sm font-sans text-gray-600 mb-2">Quantity</label>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors rounded-l-lg"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-12 text-center font-sans text-sm">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors rounded-r-lg"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <span className="text-sm text-gray-400 font-sans">
                                {product.inStock ? 'Available' : 'Out of stock'}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-sans text-sm"
                        >
                            <ShoppingCart size={18} />
                            Add to Cart
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center border rounded-lg hover:bg-gray-50 transition-colors">
                            <Heart size={18} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 font-sans">Description</h3>
                            <p className="text-sm text-gray-600 font-sans leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Product Meta */}
                    <div className="pt-2 text-xs text-gray-400 font-sans border-t">
                        <p>Category: {product.category}</p>
                        <p className="mt-1">Product ID: {product._id.slice(-8)}</p>
                    </div>
                </div>
            </div>

            {/* You May Also Like Section */}
            {relatedProducts.length > 0 && (
                <div className="border-t pt-8">
                    <h2 className="text-lg font-semibold mb-1 font-khmer text-gray-800">ផលិតផលស្រដៀងគ្នា</h2>
                    <p className="text-sm text-gray-500 mb-6 font-sans">You may also like</p>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {relatedProducts.map((related) => (
                            <div
                                key={related._id}
                                onClick={() => navigate(`/product/${related._id}`)}
                                className="group cursor-pointer"
                            >
                                <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square">
                                    <img
                                        src={related.image?.replace('/upload/', '/upload/f_auto,q_auto,w_300/') || 'https://via.placeholder.com/300x300'}
                                        alt={related.nameEn}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {related.onSale && (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded font-sans">
                                            Sale
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-khmer text-sm font-medium text-gray-800 mb-0.5 line-clamp-1">
                                        {related.nameKm}
                                    </h3>
                                    <p className="font-sans text-xs text-gray-500 mb-1 line-clamp-1">
                                        {related.nameEn}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        {related.salePrice ? (
                                            <div className="flex items-center gap-1">
                                                <span className="font-sans text-sm font-semibold text-red-600">
                                                    ${related.salePrice}
                                                </span>
                                                <span className="font-sans text-xs text-gray-400 line-through">
                                                    ${related.price}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-sans text-sm font-semibold text-gray-800">
                                                ${related.price}
                                            </span>
                                        )}
                                        <button
                                            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(related, 1);
                                            }}
                                        >
                                            <ShoppingCart size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;