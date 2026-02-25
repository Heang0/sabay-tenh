import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/admin/AddProduct';
import ProductList from './pages/admin/ProductList';
import EditProduct from './pages/admin/EditProduct';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import { ShoppingCart } from 'lucide-react';
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
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Fetch products when component mounts
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

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    // TODO: Filter products by category
    console.log('Category clicked:', categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show header on non-admin routes */}
      {!isAdminRoute && <Header />}
      <CartSidebar />

      <main className={`container mx-auto px-4 py-4 sm:py-8 ${isAdminRoute ? 'pt-0' : ''}`}>
        <Routes>
          <Route path="/" element={
            <>
              {/* Banner Image */}
              <div className="w-full mb-6 sm:mb-8">
                <img
                  src={bannerImage}
                  alt="Banner"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>

              {/* Dynamic Categories from API */}
              {categories.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg font-semibold mb-3 font-khmer">ប្រភេទផលិតផល</h2>
                  <div className="overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex space-x-2 min-w-max px-1">
                      {categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleCategoryClick(category._id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
                        >
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-khmer text-sm">{category.nameKm}</span>
                          <span className="font-sans text-xs text-gray-500 hidden sm:inline">
                            {category.nameEn}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <p className="text-red-600 font-sans">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Product Grid - Dynamic from API */}
              {!loading && !error && (
                <>
                  {products.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-gray-600 font-sans">No products found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                          onClick={() => window.location.href = `/product/${product._id}`}
                        >
                          {/* Product Image */}
                          <div className="relative pb-[100%] bg-gray-200 overflow-hidden">
                            <img
                              src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_600/') || 'https://via.placeholder.com/600x600'}
                              alt={product.nameEn}
                              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {product.onSale && (
                              <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm rounded font-sans z-10">
                                Sale
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-2 sm:p-3 md:p-4">
                            <h3 className="font-khmer text-sm sm:text-base md:text-lg lg:text-xl mb-0.5 sm:mb-1 line-clamp-2">
                              {product.nameKm}
                            </h3>
                            <p className="font-sans text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-1">
                              {product.nameEn}
                            </p>
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <div>
                                {product.salePrice ? (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="font-sans text-xs sm:text-sm md:text-base lg:text-lg font-bold text-red-600">
                                      ${product.salePrice}
                                    </span>
                                    <span className="font-sans text-xs text-gray-400 line-through">
                                      ${product.price}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-sans text-sm sm:text-base md:text-lg font-bold text-gray-800">
                                    ${product.price}
                                  </span>
                                )}
                              </div>
                              <button
                                className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product, 1);
                                }}
                              >
                                <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* View More Button */}
              {!loading && !error && products.length > 0 && (
                <div className="text-center mt-6 sm:mt-8 md:mt-10">
                  <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-sans text-sm sm:text-base">
                    មើលផលិតផលទាំងអស់
                    <span className="hidden sm:inline ml-2">View All Products</span>
                  </button>
                </div>
              )}
            </>
          } />

          {/* Product Detail Route */}
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Login Route */}
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

      {/* Only show footer on non-admin routes */}
      {!isAdminRoute && (
        <footer className="bg-white border-t mt-8 sm:mt-12 py-4 sm:py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="font-khmer text-xs sm:text-sm text-gray-600">
              © 2026 ហាងអនឡាញ
            </p>
            <p className="font-sans text-xs text-gray-500 mt-1">
              Online Shop. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;