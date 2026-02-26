import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import Login from './pages/Login';
import Sale from './pages/Sale';
import Contact from './pages/Contact';
import OrderTracking from './pages/OrderTracking';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import PaymentPage from './pages/PaymentPage';
import OrderSuccess from './pages/OrderSuccess';
import AddProduct from './pages/admin/AddProduct';
import { useLanguage } from './context/LanguageContext';
import { fetchProducts, fetchCategories } from './services/api';
import { useSearch } from './context/SearchContext';
import ProductList from './pages/admin/ProductList';
import EditProduct from './pages/admin/EditProduct';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import { ShoppingCart, Search } from 'lucide-react';
import bannerImage from './assets/bannner.jpg';
import { fetchProducts } from './services/api';
import { useCart } from './context/CartContext';

function AppContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const { searchQuery } = useSearch();
  const navigate = useNavigate();

  // Route checks
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCheckoutRoute = location.pathname === '/checkout';
  const isProductRoute = location.pathname.startsWith('/product');
  const isPaymentRoute = location.pathname.startsWith('/payment');
  const isOrderSuccessRoute = location.pathname.startsWith('/order-success');
  const hideHeader = isAdminRoute || isCheckoutRoute || isPaymentRoute || isOrderSuccessRoute;

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const productsPerPage = 20;

  // Filter products by category AND search
  const filteredProducts = products.filter(product => {
    // Category filter
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;

    // Search filter - if no search query, just return category match
    if (!searchQuery) return categoryMatch;

    // Case-insensitive search in both languages and description
    const searchLower = searchQuery.toLowerCase();
    const nameKmMatch = product.nameKm.toLowerCase().includes(searchLower);
    const nameEnMatch = product.nameEn.toLowerCase().includes(searchLower);
    const descMatch = product.description?.toLowerCase().includes(searchLower) || false;

    return categoryMatch && (nameKmMatch || nameEnMatch || descMatch);
  });

  // Pagination
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
        const data = await fetchCategories(); // Using the API function
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, searchQuery]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const clearSearch = () => {
    // This will be handled by the header component
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && <Header />}
      <CartSidebar />

      <main className={`container mx-auto px-4 ${isAdminRoute ? 'pt-0' :
        isProductRoute ? 'pt-2' :
          isCheckoutRoute ? 'pt-0' :
            isPaymentRoute ? 'pt-0' :
              isOrderSuccessRoute ? 'pt-0' : 'pt-4 sm:pt-6'
        }`}>
        <Routes>
          <Route path="/" element={
            <>
              {/* Banner Image */}
              <div className="relative w-full mb-6 sm:mb-8 rounded-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#005E7B]/20 to-transparent z-10"></div>
                <img
                  src={bannerImage}
                  alt="Banner"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Search Results Indicator */}
              {searchQuery && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-[#005E7B]" />
                    <p className={`text-sm text-[#005E7B] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {language === 'km'
                        ? `កំពុងស្វែងរក: "${searchQuery}" (បានរកឃើញ ${filteredProducts.length} មុខទំនិញ)`
                        : `Searching for: "${searchQuery}" (Found ${filteredProducts.length} items)`}
                    </p>
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.filter(category => products.some(product => product.category === category._id)).length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold font-khmer text-gray-800">
                      {language === 'km' ? 'ប្រភេទផលិតផល' : 'Product Categories'}
                    </h2>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide pb-2">
                    <div className="flex space-x-2 min-w-max px-1">
                      {/* All Products Button */}
                      <button
                        onClick={() => handleCategoryClick('all')}
                        className={`group flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm transition-all whitespace-nowrap ${selectedCategory === 'all'
                          ? 'bg-[#005E7B] text-white'
                          : 'bg-white border border-gray-200 hover:border-[#005E7B] hover:bg-[#005E7B]/5'
                          }`}
                      >
                        <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-sm`}>
                          {language === 'km' ? 'ផលិតផលទាំងអស់' : 'All Products'}
                        </span>
                      </button>

                      {/* First, create a list of categories that have products */}
                      {(() => {
                        // Get unique category IDs that actually have products
                        const categoriesWithProducts = categories.filter(category =>
                          products.some(product => product.category === category._id)
                        );

                        return categoriesWithProducts.map((category) => (
                          <button
                            key={category._id}
                            onClick={() => handleCategoryClick(category._id)}
                            className={`group flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm transition-all whitespace-nowrap ${selectedCategory === category._id
                              ? 'bg-[#005E7B] text-white'
                              : 'bg-white border border-gray-200 hover:border-[#005E7B] hover:bg-[#005E7B]/5'
                              }`}
                          >
                            <span className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-sm`}>
                              {language === 'km' ? category.nameKm : category.nameEn}
                            </span>
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State - Modern with Icon */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    {/* Outer ring */}
                    <div className="w-12 h-12 border-2 border-gray-100 rounded-full"></div>
                    {/* Spinning inner ring with brand color */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#005E7B] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 font-sans">
                    Loading...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <p className="text-red-500 font-sans text-sm mb-3">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#005E7B] text-white rounded-lg hover:bg-[#004b63] transition-colors font-sans text-xs"
                  >
                    {language === 'km' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
                  </button>
                </div>
              )}

              {/* Product Grid */}
              {!loading && !error && (
                <>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                      <Search size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className={`text-gray-600 text-base mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {searchQuery
                          ? (language === 'km'
                            ? `មិនមានផលិតផលសម្រាប់ "${searchQuery}"`
                            : `No products found for "${searchQuery}"`)
                          : (language === 'km' ? 'មិនមានផលិតផលទេ' : 'No products found.')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold font-khmer text-gray-800">
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
                          <span className={`text-sm text-[#005E7B] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {filteredProducts.length} {language === 'km' ? 'មុខទំនិញ' : 'items'}
                          </span>
                        )}
                      </div>

                      {/* Product Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {displayedProducts.map((product) => (
                          <div
                            key={product._id}
                            onClick={() => navigate(`/product/${product.slug}`)}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                          >
                            {/* Product Image */}
                            <div className="relative pb-[100%] bg-gray-100 overflow-hidden">
                              <img
                                src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_400/') || 'https://via.placeholder.com/400x400'}
                                alt={product.nameEn}
                                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              {product.onSale && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full shadow-sm z-10">
                                  {language === 'km' ? 'បញ្ចុះតម្លៃ' : 'Sale'}
                                </span>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="p-3">
                              <h3 className="font-khmer text-base font-medium text-gray-800 mb-1 line-clamp-2">
                                {product.nameKm}
                              </h3>
                              <p className="font-sans text-xs text-gray-500 mb-2 line-clamp-1">
                                {product.nameEn}
                              </p>
                              <div className="flex items-center justify-between">
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
                        ))}
                      </div>

                      {/* Load More Button */}
                      {hasMore && (
                        <div className="text-center mt-8">
                          <button
                            onClick={loadMore}
                            className="px-8 py-3 bg-[#005E7B] text-white rounded-full hover:bg-[#004b63] transition-all font-sans text-sm font-medium shadow-sm hover:shadow-md hover:scale-105"
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
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-product" element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit-product/:id" element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      {!hideHeader && (
        <footer className="bg-white border-t mt-8 sm:mt-10 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="font-khmer text-xs sm:text-sm text-gray-500">
              © 2026  Sabay Tenh. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;