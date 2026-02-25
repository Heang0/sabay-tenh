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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 font-sans text-sm">Product not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans text-xs"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pt-2 pb-8">
            {/* Back Button - Smaller */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-gray-400 hover:text-blue-600 mb-3 font-sans text-xs transition-colors"
            >
                <ArrowLeft size={14} />
                <span>Back</span>
            </button>

            {/* Product Main Section - Tight Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                {/* Product Image */}
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <img
                        src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_600/') || 'https://via.placeholder.com/600x600'}
                        alt={product.nameEn}
                        className="w-full h-auto object-cover"
                    />
                </div>

                {/* Product Info - Compact */}
                <div className="space-y-3">
                    {/* Title */}
                    <div>
                        <h1 className="text-xl font-bold font-khmer text-gray-800 mb-0.5">{product.nameKm}</h1>
                        <p className="text-sm text-gray-500 font-sans">{product.nameEn}</p>
                    </div>

                    {/* Price - Compact */}
                    <div className="flex items-center gap-2">
                        {product.salePrice ? (
                            <>
                                <span className="text-xl font-bold text-red-600 font-sans">
                                    ${product.salePrice}
                                </span>
                                <span className="text-sm text-gray-400 line-through font-sans">
                                    ${product.price}
                                </span>
                                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium">
                                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-gray-800 font-sans">
                                ${product.price}
                            </span>
                        )}
                    </div>

                    {/* Stock Status - Small */}
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`text-xs font-sans ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            {product.inStock ? 'In stock' : 'Out of stock'}
                        </span>
                    </div>

                    {/* Quantity Selector - Compact */}
                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center border rounded-md">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="w-8 text-center font-sans text-xs">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors font-sans text-xs"
                        >
                            <ShoppingCart size={14} />
                            Add to Cart
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center border rounded-lg hover:bg-gray-50 transition-colors">
                            <Heart size={14} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Description - Only if exists */}
                    {product.description && (
                        <div className="pt-2">
                            <p className="text-xs text-gray-600 font-sans leading-relaxed line-clamp-3">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* You May Also Like Section - Compact */}
            {relatedProducts.length > 0 && (
                <div className="border-t pt-4">
                    <h2 className="text-base font-semibold mb-2 font-khmer text-gray-800">ផលិតផលស្រដៀងគ្នា</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {relatedProducts.map((related) => (
                            <div
                                key={related._id}
                                onClick={() => navigate(`/product/${related._id}`)}
                                className="group cursor-pointer"
                            >
                                <div className="bg-gray-50 rounded-md overflow-hidden mb-1.5 aspect-square">
                                    <img
                                        src={related.image?.replace('/upload/', '/upload/f_auto,q_auto,w_200/') || 'https://via.placeholder.com/200x200'}
                                        alt={related.nameEn}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {related.onSale && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white px-1 py-0.5 text-[8px] rounded font-sans">
                                            Sale
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-khmer text-xs font-medium text-gray-800 mb-0.5 line-clamp-1">
                                        {related.nameKm}
                                    </h3>
                                    <p className="font-sans text-[10px] text-gray-500 mb-1 line-clamp-1">
                                        {related.nameEn}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        {related.salePrice ? (
                                            <div className="flex items-center gap-1">
                                                <span className="font-sans text-xs font-semibold text-red-600">
                                                    ${related.salePrice}
                                                </span>
                                                <span className="font-sans text-[9px] text-gray-400 line-through">
                                                    ${related.price}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-sans text-xs font-semibold text-gray-800">
                                                ${related.price}
                                            </span>
                                        )}
                                        <button
                                            className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(related, 1);
                                            }}
                                        >
                                            <ShoppingCart size={10} />
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