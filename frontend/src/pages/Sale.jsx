import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, Percent } from 'lucide-react';
import { fetchProducts } from '../services/api';

const Sale = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { language } = useLanguage();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);
    const productsPerPage = 20;

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const allProducts = await fetchProducts();
                const saleProducts = allProducts.filter(p => p.onSale === true);
                setProducts(saleProducts);
            } catch (error) {
                console.error('Error loading sale products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const displayedProducts = products.slice(0, visibleCount);
    const hasMore = visibleCount < products.length;

    const loadMore = () => {
        setVisibleCount(prev => prev + productsPerPage);
    };

    const getDiscountPercentage = (price, salePrice) => {
        if (!salePrice) return 0;
        return Math.round(((price - salePrice) / price) * 100);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
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

    return (
        <>
            {/* Header - exactly like home page */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Percent size={18} className="text-red-500" />
                    <h2 className="text-lg font-semibold font-khmer text-gray-800">
                        {language === 'km' ? 'ទំនិញបញ្ចុះតម្លៃ' : 'Sale Items'}
                    </h2>
                </div>
                <span className="text-xs text-gray-400 font-sans">{products.length} items</span>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-sans text-sm">
                        {language === 'km' ? 'មិនទាន់មានទំនិញបញ្ចុះតម្លៃទេ' : 'No sale items yet'}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-[#005E7B] text-white rounded-lg hover:bg-[#004b63] transition-colors font-sans text-xs"
                    >
                        {language === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
                    </button>
                </div>
            ) : (
                <>
                    {/* Product Grid - EXACT same as home page */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {displayedProducts.map((product) => {
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
                                        {/* Sale Badge - percentage */}
                                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full shadow-sm z-10">
                                            -{discount}%
                                        </span>
                                    </div>

                                    {/* Product Info - EXACT same as home page */}
                                    <div className="p-3 flex flex-col flex-grow">
                                        {/* Product Name - Only ONE language */}
                                        <h3 className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-base font-medium text-gray-800 mb-1 line-clamp-2`}>
                                            {language === 'km' ? product.nameKm : product.nameEn}
                                        </h3>

                                        {/* Price and Cart - pushed to bottom */}
                                        <div className="flex items-center justify-between mt-auto pt-2">
                                            <div className="flex items-center gap-1">
                                                <span className="font-sans text-sm font-bold text-red-600">
                                                    ${product.salePrice}
                                                </span>
                                                <span className="font-sans text-xs text-gray-400 line-through">
                                                    ${product.price}
                                                </span>
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
                    {hasMore && (
                        <div className="text-center mt-6 sm:mt-8 md:mt-10">
                            <button
                                onClick={loadMore}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-sans text-sm sm:text-base"
                            >
                                {language === 'km' ? 'ផ្ទុកបន្ថែម' : 'Load More'} ({displayedProducts.length} / {products.length})
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Sale;