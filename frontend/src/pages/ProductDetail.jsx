import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, ArrowLeft, Heart, Minus, Plus } from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '../services/api';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { language } = useLanguage();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    // Pagination for related products
    const [relatedVisibleCount, setRelatedVisibleCount] = useState(8);
    const relatedPerPage = 8;
    const displayedRelated = relatedProducts.slice(0, relatedVisibleCount);
    const hasMoreRelated = relatedVisibleCount < relatedProducts.length;

    const loadMoreRelated = () => {
        setRelatedVisibleCount(prev => prev + relatedPerPage);
    };

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const productData = await fetchProductBySlug(slug);
                setProduct(productData);

                const allProducts = await fetchProducts();
                const related = allProducts
                    .filter(p => p.category === productData.category && p._id !== productData._id);
                setRelatedProducts(related);

            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [slug]);

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    const getDiscountPercentage = (price, salePrice) => {
        if (!salePrice) return 0;
        return Math.round(((price - salePrice) / price) * 100);
    };
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-gray-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#005E7B] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-sm text-gray-500 font-sans">
                    Loading...
                </p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 font-sans text-sm">Product not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-3 px-4 py-1.5 bg-[#005E7B] text-white rounded-lg hover:bg-[#004b63] font-sans text-xs"
                >
                    {language === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Back Button */}
            {/* Back Button - Modern Icon Only */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 mb-3 ml-2 sm:ml-0 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-gray-700 hover:text-[#005E7B] border border-gray-100"
                aria-label="Go back"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Product Main Section - edge-to-edge on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 mb-8">

                {/* Product Image - square on all devices */}
                <div className="w-full md:max-w-md lg:max-w-lg mx-auto bg-gray-50">
                    <div className="relative pb-[100%] overflow-hidden rounded-lg md:rounded-xl">
                        <img
                            src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_600/') || 'https://via.placeholder.com/600x600'}
                            alt={product.nameEn}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Product Info - padding only on mobile */}
                <div className="px-4 md:px-0 py-4 md:py-0 space-y-3">
                    {/* Title - Only ONE language */}
                    {/* Title - Only ONE language */}
                    <div>
                        <h1 className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-lg sm:text-base md:text-lg lg:text-xl font-medium text-gray-800 mb-0.5`}>
                            {language === 'km' ? product.nameKm : product.nameEn}
                        </h1>
                    </div>

                    {/* Price */}
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
                                    -{getDiscountPercentage(product.price, product.salePrice)}%
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-gray-800 font-sans">
                                ${product.price}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`text-xs ${language === 'km' ? 'font-khmer' : 'font-sans'} ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            {product.inStock ? (language === 'km' ? 'មានស្តុក' : 'In stock') : (language === 'km' ? 'អស់ស្តុក' : 'Out of stock')}
                        </span>
                    </div>

                    {/* Quantity Selector */}
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className="w-full flex items-center justify-center gap-1.5 bg-[#005E7B] text-white py-3 px-2 rounded-lg hover:bg-[#004b63] disabled:bg-gray-200 disabled:text-gray-400 transition-colors text-xs sm:text-sm whitespace-normal break-words"
                        >
                            <ShoppingCart size={16} className="flex-shrink-0" />
                            <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-center leading-tight`}>
                                {language === 'km' ? 'បន្ថែមក្នុងកន្ត្រក' : 'Add to Cart'}
                            </span>
                        </button>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="pt-2">
                            <p className="text-xs text-gray-600 font-sans leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* You May Also Like Section - All products in same category */}
            {relatedProducts.length > 0 && (
                <div className="w-full border-t mt-4">
                    {/* Title with mobile padding */}
                    <div className="flex items-center justify-between px-4 md:px-0 mt-4">
                        <h2 className="text-base font-semibold font-khmer text-gray-800">
                            {language === 'km' ? 'ផលិតផលស្រដៀងគ្នា' : 'You May Also Like'}
                        </h2>
                        <span className="text-xs text-gray-400 font-sans">
                            {relatedProducts.length} {language === 'km' ? 'មុខទំនិញ' : 'items'}
                        </span>
                    </div>

                    {/* Grid - edge-to-edge on mobile (px-0) */}
                    <div className="px-0 md:px-0 mt-3">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                            {displayedRelated.map((product) => {
                                const discount = getDiscountPercentage(product.price, product.salePrice);

                                return (
                                    <div
                                        key={product._id}
                                        onClick={() => navigate(`/product/${product.slug}`)}
                                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer flex flex-col h-full"
                                    >
                                        {/* Product Image */}
                                        <div className="relative pb-[100%] bg-gray-200 overflow-hidden flex-shrink-0">
                                            <img
                                                src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_400/') || 'https://via.placeholder.com/400x400'}
                                                alt={product.nameEn}
                                                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                            {product.onSale && (
                                                <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full shadow-sm z-10">
                                                    -{discount}%
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Info - EXACT same as home page */}
                                        <div className="p-3 flex flex-col flex-grow">
                                            <h3 className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-base font-medium text-gray-800 mb-1 line-clamp-2`}>
                                                {language === 'km' ? product.nameKm : product.nameEn}
                                            </h3>

                                            <div className="flex items-center justify-between mt-auto pt-2">
                                                <div>
                                                    {product.salePrice ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-sans text-sm font-bold text-red-600">
                                                                ${product.salePrice}
                                                            </span>
                                                            <span className="font-sans text-xs text-gray-400 line-through">
                                                                ${product.price}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-sans text-sm font-bold text-gray-800">
                                                            ${product.price}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    className="p-2 bg-[#005E7B] text-white rounded-full hover:bg-[#004b63] hover:scale-110 transition-all duration-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product, 1);
                                                    }}
                                                >
                                                    <ShoppingCart size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load More Button */}
                        {hasMoreRelated && (
                            <div className="text-center mt-6">
                                <button
                                    onClick={loadMoreRelated}
                                    className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-sans text-sm font-medium shadow-sm hover:shadow"
                                >
                                    {language === 'km' ? 'ផ្ទុកបន្ថែម' : 'Load More'} ({displayedRelated.length} / {relatedProducts.length})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetail;