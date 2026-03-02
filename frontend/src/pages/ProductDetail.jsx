import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import ReviewSection from '../components/ReviewSection';
import { ShoppingCart, ArrowLeft, Heart, Minus, Plus } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProductBySlug, fetchProducts } from '../services/api';
import { motion } from 'framer-motion';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { language } = useLanguage();
    const { isLoggedIn } = useUser();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');

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
                setActiveImage(productData.image);

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

    // Helper to optimize Cloudinary URLs safely
    const getOptimizedUrl = (url, width) => {
        if (!url) return 'https://via.placeholder.com/' + width;
        if (!url.includes('cloudinary.com')) return url;

        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return url;

        const baseUrl = url.substring(0, uploadIndex + 8);
        const remainingUrl = url.substring(uploadIndex + 8);

        // Skip existing transformation segments
        const parts = remainingUrl.split('/');
        const cleanParts = parts.filter(p => !p.includes(',') && !p.includes('w_') && !p.includes('f_auto') && !p.includes('q_auto'));

        return `${baseUrl}f_auto,q_auto,w_${width},dpr_auto/${cleanParts.join('/')}`;
    };
    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Image Skeleton */}
                    <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <div className="w-full h-full animate-pulse bg-gray-200"></div>
                    </div>

                    {/* Info Skeleton */}
                    <div className="space-y-4">
                        <div className="h-8 w-3/4 animate-pulse bg-gray-200 rounded"></div>
                        <div className="h-6 w-1/4 animate-pulse bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/3 animate-pulse bg-gray-200 rounded"></div>
                        <div className="flex gap-4 pt-4">
                            <div className="h-12 flex-1 animate-pulse bg-gray-200 rounded-lg"></div>
                            <div className="h-12 w-12 animate-pulse bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="space-y-2 pt-6">
                            <div className="h-3 w-full animate-pulse bg-gray-200 rounded"></div>
                            <div className="h-3 w-full animate-pulse bg-gray-200 rounded"></div>
                            <div className="h-3 w-2/3 animate-pulse bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
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

                {/* Product Image & Gallery */}
                <div className="w-full md:max-w-md lg:max-w-lg mx-auto bg-white p-2">
                    {/* Main Image View */}
                    <div className="relative pb-[100%] overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
                        <motion.img
                            key={activeImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            src={getOptimizedUrl(activeImage || product.image, 800)}
                            alt={product.nameEn}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {product.onSale && (
                            <span className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                                -{getDiscountPercentage(product.price, product.salePrice)}%
                            </span>
                        )}
                    </div>

                    {/* Gallery Swatches */}
                    {product.images && product.images.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => setActiveImage(product.image)}
                                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-[#005E7B] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img src={getOptimizedUrl(product.image, 200)} className="w-full h-full object-cover" alt="Main" />
                            </button>
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#005E7B] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={getOptimizedUrl(img, 200)} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                </button>
                            ))}
                        </div>
                    )}
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
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#005E7B] text-white py-3 px-2 rounded-lg hover:bg-[#004b63] disabled:bg-gray-200 disabled:text-gray-400 transition-colors text-xs sm:text-sm whitespace-normal break-words"
                        >
                            <ShoppingCart size={16} className="flex-shrink-0" />
                            <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-center leading-tight`}>
                                {language === 'km' ? 'បន្ថែមក្នុងកន្ត្រក' : 'Add to Cart'}
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                if (!isLoggedIn) { navigate('/user-login'); return; }
                                toggleWishlist(product._id);
                            }}
                            className={`w-12 h-12 flex items-center justify-center border rounded-lg transition-colors ${isInWishlist(product._id)
                                ? 'border-red-200 bg-red-50 text-red-500'
                                : 'border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                                }`}
                        >
                            <Heart size={20} className={isInWishlist(product._id) ? 'fill-red-500' : ''} />
                        </button>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="pt-2">
                            <p className="text-sm sm:text-base text-gray-600 font-sans leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                {product && <ReviewSection productId={product._id} />}
            </div>

            {/* You May Also Like Section - All products in same category */}
            {relatedProducts.length > 0 && (
                <div className="w-full border-t mt-4">
                    {/* Title with mobile padding */}
                    <div className="flex items-center justify-between px-0 md:px-0 mt-4">
                        <h2 className={`text-xl sm:text-2xl font-semibold mb-3 mt-4 px-0 sm:px-4 md:px-0 ${language === 'km' ? 'font-khmer' : 'font-sans'} text-gray-800`}>
                            {language === 'km' ? 'ផលិតផលស្រដៀងគ្នា' : 'You May Also Like'}
                        </h2>
                    </div>

                    {/* Grid - edge-to-edge on mobile (px-0) */}
                    <div className="px-0 md:px-0 mt-3">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                            {displayedRelated.map((product, index) => (
                                <ProductCard key={product._id} product={product} index={index} />
                            ))}
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
        </motion.div>
    );
};

export default ProductDetail;