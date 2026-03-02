import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://sabay-tenh.onrender.com/api';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { isLoggedIn, getToken } = useUser();
    const { language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const km = language === 'km';

    useEffect(() => {
        // Assuming useWishlist provides isLoggedIn or a check for it
        // If not, you might need to re-introduce useUser or a similar check
        loadWishlist();
    }, []); // Removed isLoggedIn from dependency array as it's not directly from useUser anymore

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                navigate('/user-login'); // Redirect if no token
                return;
            }
            const response = await fetch(`${API_URL}/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
            } else if (response.status === 401) {
                navigate('/user-login'); // Redirect on unauthorized
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
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
                <div className="max-w-5xl mx-auto h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all border border-gray-100 active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={`text-lg font-bold text-gray-900 leading-tight ${km ? 'font-khmer' : 'font-sans'}`}>
                                {km ? 'បញ្ជីចង់បាន' : 'My Wishlist'}
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                <p className={`text-xs text-gray-400 font-medium ${km ? 'font-khmer' : 'font-sans'}`}>
                                    {products.length} {km ? 'មុខទំនិញ' : 'items saved'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                        <Heart size={20} className="fill-red-500" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-6">
                {loading ? (
                    <div className="flex flex-col items-center py-24 gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-gray-100 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#005E7B] rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className={`text-sm text-gray-400 font-medium ${km ? 'font-khmer' : 'font-sans'}`}>
                            {km ? 'កំពុងផ្ទុក...' : 'Loading items...'}
                        </p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-50 px-6">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-12 shadow-inner">
                            <Heart size={36} className="text-red-300" />
                        </div>
                        <h2 className={`text-xl font-bold text-gray-800 mb-2 ${km ? 'font-khmer' : ''}`}>
                            {km ? 'បញ្ជីចង់បានរបស់អ្នកទទេ' : 'Your wishlist is empty'}
                        </h2>
                        <p className={`text-gray-400 text-sm mb-8 max-w-xs mx-auto ${km ? 'font-khmer leading-relaxed' : ''}`}>
                            {km ? 'ចុះ♥ លើផលិតផលដែលអ្នកចូលចិត្ត ដើម្បីរក្សាទុកវានៅទីនេះ' : 'Tap the heart icon on any product to save it here for later.'}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#005E7B] to-teal-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-teal-100 hover:shadow-teal-200 hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            <ShoppingCart size={18} />
                            {km ? 'ទៅកាន់ហាង' : 'Start Shopping'}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3 md:gap-4">
                        {products.map((product, index) => (
                            <ProductCard key={product._id} product={product} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export default WishlistPage;

