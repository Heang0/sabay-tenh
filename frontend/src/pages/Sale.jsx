import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, Percent } from 'lucide-react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const Sale = () => {
    const navigate = useNavigate();
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-gray-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#005E7B] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className={`text-sm text-gray-400 font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'កំពុងផ្ទុក...' : 'Loading sale items...'}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                        <Percent size={24} />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' ? 'ទំនិញបញ្ចុះតម្លៃ' : 'Flash Sale'}
                        </h2>
                        <p className={`text-sm text-gray-400 font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {products.length} {language === 'km' ? 'មុខទំនិញ' : 'items discounted'}
                        </p>
                    </div>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-50 px-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart size={48} className="text-gray-200" />
                    </div>
                    <p className={`text-gray-500 text-lg font-medium mb-8 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {language === 'km' ? 'មិនទាន់មានទំនិញបញ្ចុះតម្លៃទេ' : 'No sale items yet'}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-[#005E7B] text-white rounded-2xl hover:bg-[#004b63] transition-all font-bold shadow-lg shadow-blue-100 hover:shadow-blue-200"
                    >
                        {language === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
                    </button>
                </div>
            ) : (
                <>
                    {/* Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {displayedProducts.map((product, index) => (
                            <ProductCard key={product._id} product={product} index={index} />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center mt-12">
                            <button
                                onClick={loadMore}
                                className="inline-flex items-center justify-center px-10 py-3.5 bg-white border border-gray-200 text-gray-800 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm hover:shadow-md"
                            >
                                {language === 'km' ? 'បង្ហាញបន្ថែម' : 'Load More Products'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Sale;