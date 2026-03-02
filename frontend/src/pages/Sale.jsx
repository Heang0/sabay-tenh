import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Package, Percent, ShoppingBag, ArrowLeft } from 'lucide-react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const Sale = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const km = language === 'km';

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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ── Premium Sticky Header ── */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all border border-gray-100 active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={`text-lg font-bold text-gray-900 leading-tight ${km ? 'font-khmer' : 'font-sans'}`}>
                                {km ? 'ទំនិញបញ្ចុះតម្លៃ' : 'Flash Sale'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                <p className={`text-[11px] text-gray-500 font-medium tracking-wide uppercase ${km ? 'font-khmer' : 'font-sans'}`}>
                                    {products.length} {km ? 'មុខទំនិញ' : 'Items Discounted'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
                {/* ── Banner ── */}
                <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl shadow-red-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-500 opacity-90"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                    <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold mb-4 uppercase tracking-widest border border-white/30">
                                <Zap size={14} className="fill-white" />
                                {km ? 'ការផ្តល់ជូនពិសេស' : 'Exclusive Offer'}
                            </div>
                            <h2 className={`text-3xl sm:text-4xl font-extrabold text-white mb-2 ${km ? 'font-khmer' : 'font-sans'}`}>
                                {km ? 'តំលៃពិសេស' : 'Premium Savings'}
                            </h2>
                            <p className={`text-red-50 text-base sm:text-lg max-w-md ${km ? 'font-khmer' : 'font-sans'}`}>
                                {km ? 'ទទួលបានការបញ្ចុះតម្លៃរហូតដល់ ៥០%' : 'Get up to 50% discount on selected premium items today.'}
                            </p>
                        </div>
                        <div className="hidden lg:flex w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full items-center justify-center border border-white/20 animate-pulse">
                            <Percent size={48} className="text-white" />
                        </div>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 px-6 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                            <ShoppingCart size={48} className="text-red-200" />
                        </div>
                        <h3 className={`text-xl font-bold text-gray-900 mb-2 ${km ? 'font-khmer' : 'font-sans'}`}>
                            {km ? 'មិនទាន់មានទំនិញបញ្ចុះតម្លៃទេ' : 'No Sale Items Yet'}
                        </h3>
                        <p className={`text-gray-500 mb-8 max-w-sm mx-auto ${km ? 'font-khmer' : 'font-sans'}`}>
                            {km ? 'សូមត្រឡប់មកវិញនៅពេលក្រោយសម្រាប់ការផ្តល់ជូនថ្មីៗ' : 'Check back later for new arrivals and exciting discounts on your favorite products.'}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[#005E7B] text-white rounded-2xl hover:bg-[#004b63] transition-all font-bold shadow-lg shadow-blue-100 hover:shadow-blue-200 active:scale-95"
                        >
                            <ArrowLeft size={18} />
                            {km ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Product Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                            {displayedProducts.map((product, index) => (
                                <div key={product._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <ProductCard product={product} index={index} />
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={loadMore}
                                    className="inline-flex items-center justify-center px-12 py-4 bg-white border border-gray-200 text-gray-800 rounded-2xl hover:bg-gray-50 hover:border-[#005E7B] hover:text-[#005E7B] transition-all font-bold text-sm shadow-sm hover:shadow-md active:scale-95 group"
                                >
                                    <span className="mr-2 group-hover:rotate-180 transition-transform duration-500">🔄</span>
                                    {km ? 'បង្ហាញបន្ថែម' : 'Load More Products'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sale;
