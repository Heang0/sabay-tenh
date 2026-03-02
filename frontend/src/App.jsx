import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import HeroSlider from './components/HeroSlider';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import WishlistPage from './pages/WishlistPage';
import Sale from './pages/Sale';
import Contact from './pages/Contact';
import OrderTracking from './pages/OrderTracking';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import PaymentPage from './pages/PaymentPage';
import OrderSuccess from './pages/OrderSuccess';
import AddProduct from './pages/admin/AddProduct';
import CouponManagement from './pages/admin/CouponManagement';
import { useLanguage } from './context/LanguageContext';
import { fetchProducts, fetchCategories, fetchFeaturedProducts } from './services/api';
import { useSearch } from './context/SearchContext';
import { useWishlist } from './context/WishlistContext';
import { useUser } from './context/UserContext';
import ProductList from './pages/admin/ProductList';
import EditProduct from './pages/admin/EditProduct';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import { ShoppingCart, Search, Heart, Star, Facebook, MessageCircle, Mail, Phone } from 'lucide-react';
import { useCart } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import ProductCard from './components/ProductCard';
import Skeleton, { ProductSkeleton, CategorySkeleton } from './components/Skeleton';

function AppContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const { searchQuery } = useSearch();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();

  // Route checks
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCheckoutRoute = location.pathname === '/checkout';
  const isProductRoute = location.pathname.startsWith('/product');
  const isPaymentRoute = location.pathname.startsWith('/payment');
  const isOrderSuccessRoute = location.pathname.startsWith('/order-success');
  const isAuthRoute = ['/user-login', '/register', '/login'].includes(location.pathname);
  const hideHeader = isAdminRoute || isCheckoutRoute || isPaymentRoute || isOrderSuccessRoute || isAuthRoute;

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const productsPerPage = 20;

  const [showBackToTop, setShowBackToTop] = useState(false);

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    if (!searchQuery) return categoryMatch;
    const searchLower = searchQuery.toLowerCase();
    const nameKmMatch = product.nameKm.toLowerCase().includes(searchLower);
    const nameEnMatch = product.nameEn.toLowerCase().includes(searchLower);
    const descMatch = product.description?.toLowerCase().includes(searchLower) || false;
    return categoryMatch && (nameKmMatch || nameEnMatch || descMatch);
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + productsPerPage);
  };

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load featured products for homepage
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await fetchFeaturedProducts();
        setNewArrivals(data.newArrivals || []);
        setOnSaleProducts(data.onSale || []);
      } catch (err) {
        console.error('Failed to load featured:', err);
      }
    };
    loadFeatured();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, searchQuery]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Horizontal scroll section component
  const ProductScrollSection = ({ title, products: sectionProducts, viewAllLink }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-xl sm:text-2xl font-semibold ${language === 'km' ? 'font-khmer' : 'font-sans'} text-gray-800`}>
          {title}
        </h2>
        {viewAllLink && (
          <button
            onClick={() => navigate(viewAllLink)}
            className={`text-sm text-[#005E7B] hover:underline ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
          >
            {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-3 min-w-max">
          {sectionProducts.map((product, index) => (
            <div key={product._id} className="w-40 sm:w-48 flex-shrink-0">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideHeader && <Header />}
      <CartSidebar />

      <main className={`flex-1 container mx-auto px-2 sm:px-4 ${isAdminRoute ? 'pt-0 pb-8' :
        isProductRoute ? 'pt-2 pb-8' :
          isCheckoutRoute ? 'pt-0 pb-8' :
            isPaymentRoute ? 'pt-0 pb-8' :
              isOrderSuccessRoute ? 'pt-0 pb-8' :
                isAuthRoute ? 'pt-0 pb-0' : 'pt-4 sm:pt-6 pb-8'
        }`}>
        <Routes>
          {/* Home Route */}
          <Route path="/" element={
            <>
              {/* Hero Slider */}
              <HeroSlider language={language} />

              {/* New Arrivals Section */}
              {newArrivals.length > 0 && (
                <ProductScrollSection
                  title={language === 'km' ? ' ផលិតផលថ្មី' : ' New Arrivals'}
                  products={newArrivals}
                />
              )}

              {/* On Sale Section */}
              {onSaleProducts.length > 0 && (
                <ProductScrollSection
                  title={language === 'km' ? ' កំពុងបញ្ចុះតម្លៃ' : ' On Sale'}
                  products={onSaleProducts}
                  viewAllLink="/sale"
                />
              )}

              {/* Search Results Indicator */}
              {searchQuery && (
                <div className="mb-3 sm:mb-4 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search size={14} className="sm:size-16 text-[#005E7B]" />
                    <p className={`text-xs sm:text-sm text-[#005E7B] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {language === 'km'
                        ? `កំពុងស្វែងរក: "${searchQuery}" (បានរកឃើញ ${filteredProducts.length} មុខទំនិញ)`
                        : `Searching for: "${searchQuery}" (Found ${filteredProducts.length} items)`}
                    </p>
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.filter(category => products.some(product => product.category === category._id)).length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h2 className={`text-xl sm:text-2xl font-semibold ${language === 'km' ? 'font-khmer' : 'font-sans'} text-gray-800`}>
                      {language === 'km' ? 'ប្រភេទផលិតផល' : 'Product Categories'}
                    </h2>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide pb-2">
                    <div className="flex space-x-2 min-w-max px-1">
                      <button
                        onClick={() => handleCategoryClick('all')}
                        className={`group flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm transition-all whitespace-nowrap text-base ${selectedCategory === 'all'
                          ? 'bg-[#005E7B] text-white'
                          : 'bg-white border border-gray-200 hover:border-[#005E7B] hover:bg-[#005E7B]/5'
                          }`}
                      >
                        <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'} font-medium`}>
                          {language === 'km' ? 'ផលិតផលទាំងអស់' : 'All Products'}
                        </span>
                      </button>
                      {categories.filter(category =>
                        products.some(product => product.category === category._id)
                      ).map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleCategoryClick(category._id)}
                          className={`group flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm transition-all whitespace-nowrap text-base ${selectedCategory === category._id
                            ? 'bg-[#005E7B] text-white'
                            : 'bg-white border border-gray-200 hover:border-[#005E7B] hover:bg-[#005E7B]/5'
                            }`}
                        >
                          <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'} font-medium`}>
                            {language === 'km' ? category.nameKm : category.nameEn}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && products.length === 0 && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {/* Category Skeletons */}
                  <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
                    {[...Array(6)].map((_, i) => (
                      <CategorySkeleton key={i} />
                    ))}
                  </div>

                  {/* Product Grid Skeletons */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
                  <p className="text-red-500 font-sans text-xs sm:text-sm mb-2 sm:mb-3">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#005E7B] text-white rounded-lg hover:bg-[#004b63] transition-colors font-sans text-xs"
                  >
                    {language === 'km' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
                  </button>
                </div>
              )}

              {/* Product Grid */}
              {!loading && !error && (
                <>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
                      <Search size={32} className="sm:size-48 mx-auto text-gray-300 mb-3 sm:mb-4" />
                      <p className={`text-gray-600 text-sm sm:text-base mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {searchQuery
                          ? (language === 'km'
                            ? `មិនមានផលិតផលសម្រាប់ "${searchQuery}"`
                            : `No products found for "${searchQuery}"`)
                          : (language === 'km' ? 'មិនមានផលិតផលទេ' : 'No products found.')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className={`text-xl sm:text-2xl font-semibold ${language === 'km' ? 'font-khmer' : 'font-sans'} text-gray-800`}>
                          {selectedCategory === 'all'
                            ? (language === 'km' ? 'ផលិតផលទាំងអស់' : 'All Products')
                            : (() => {
                              const category = categories.find(c => c._id === selectedCategory);
                              return category
                                ? (language === 'km' ? category.nameKm : category.nameEn)
                                : (language === 'km' ? 'ផលិតផល' : 'Products');
                            })()
                          }
                        </h2>
                        {searchQuery && (
                          <span className={`text-xs sm:text-sm text-[#005E7B] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {filteredProducts.length} {language === 'km' ? 'មុខទំនិញ' : 'items'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3 md:gap-4">
                        {displayedProducts.map((product, index) => (
                          <ProductCard key={product._id} product={product} index={index} />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="text-center mt-4 sm:mt-6 md:mt-8">
                          <button
                            onClick={loadMore}
                            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#005E7B] text-white rounded-full hover:bg-[#004b63] transition-all font-sans text-xs sm:text-sm font-medium shadow-sm hover:shadow-md hover:scale-105"
                          >
                            {language === 'km' ? 'ផ្ទុកបន្ថែម' : 'Load More'} ({displayedProducts.length} / {filteredProducts.length})
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          } />

          {/* User Routes */}
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Other Routes */}
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/admin/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/admin/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute><CouponManagement /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#005E7B] text-white p-2 sm:p-2.5 rounded-full shadow-lg hover:bg-[#004b63] hover:scale-110 transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Redesigned Footer */}
      {!hideHeader && (
        <footer className="bg-gray-900 text-white py-8 mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {/* About */}
              <div>
                <h3 className="font-khmer text-lg font-bold mb-2">Sabay Tenh</h3>
                <p className={`text-gray-400 text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km'
                    ? 'ហាងលក់ទំនិញអនឡាញ ជាមួយផលិតផលគុណភាពល្អ និងតម្លៃសមរម្យ'
                    : 'Your trusted online store with quality products at great prices'}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className={`text-sm font-bold mb-2 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'តំណភ្ជាប់រហ័ស' : 'Quick Links'}
                </h3>
                <div className="space-y-1">
                  <button onClick={() => navigate('/')} className={`block text-gray-400 hover:text-white text-sm transition-colors ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'ទំព័រដើម' : 'Home'}
                  </button>
                  <button onClick={() => navigate('/sale')} className={`block text-gray-400 hover:text-white text-sm transition-colors ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'បញ្ចុះតម្លៃ' : 'Sale'}
                  </button>
                  <button onClick={() => navigate('/contact')} className={`block text-gray-400 hover:text-white text-sm transition-colors ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'ទំនាក់ទំនង' : 'Contact'}
                  </button>
                </div>
              </div>

              {/* Contact & Social */}
              <div>
                <h3 className={`text-sm font-bold mb-2 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ទំនាក់ទំនង' : 'Contact Us'}
                </h3>
                <div className="space-y-1 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span className="font-sans">012 345 678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span className="font-sans">info@sabaytenh.com</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Facebook size={16} />
                  </a>
                  <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <MessageCircle size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Payment Methods & Copyright */}
            <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="font-khmer text-xs text-gray-500">
                © 2026 Sabay Tenh. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-sans">
                <span>Payment:</span>
                <span className="px-2 py-0.5 bg-white/10 rounded text-white text-[10px]">ABA</span>
                <span className="px-2 py-0.5 bg-white/10 rounded text-white text-[10px]">KHQR</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;