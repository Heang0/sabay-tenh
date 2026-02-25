import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, Menu, X, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const { getItemCount, toggleCart } = useCart();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-between">
                    {/* Logo with Image */}
                    <div className="flex-shrink-0">
                        <a href="/" className="block">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-10 sm:h-12 w-auto"
                            />
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="/" className="text-gray-700 hover:text-blue-600 font-sans">Shop</a>
                        <a href="/categories" className="text-gray-700 hover:text-blue-600 font-sans">Categories</a>
                        <a href="/sale" className="text-gray-700 hover:text-blue-600 font-sans">Sale</a>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-sm"
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Language Indicator */}
                        <div className="hidden xs:flex items-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                            <span className="font-sans">EN</span>
                            <span className="mx-1">|</span>
                            <span className="font-khmer text-xs">ខ្មែរ</span>
                        </div>

                        {/* Cart Icon */}
                        <button
                            onClick={toggleCart}
                            className="relative p-1.5 sm:p-2 text-gray-700 hover:text-blue-600"
                        >
                            <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                            {getItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-sans">
                                    {getItemCount()}
                                </span>
                            )}
                        </button>

                        {/* Admin Links (only when logged in) */}
                        {isAuthenticated && (
                            <>
                                <a
                                    href="/admin"
                                    className="hidden md:inline-block px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans"
                                >
                                    Admin
                                </a>
                                <button
                                    onClick={logout}
                                    className="hidden md:inline-block p-1.5 text-gray-700 hover:text-red-600"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-1.5 sm:p-2"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden mt-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                        />
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-2 pb-2 border-t border-gray-100">
                        <div className="flex flex-col space-y-1 pt-2">
                            <a href="/" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded font-sans">
                                Home
                            </a>
                            <a href="/shop" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded font-sans">
                                All Products
                            </a>
                            <a href="/sale" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded font-sans">
                                Sale
                            </a>
                            <a href="/new" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded font-sans">
                                New Arrivals
                            </a>
                            {isAuthenticated && (
                                <>
                                    <a href="/admin" className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-sans">
                                        Admin Dashboard
                                    </a>
                                    <button
                                        onClick={logout}
                                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded font-sans text-left"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                            <a href="/contact" className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded font-sans">
                                Contact
                            </a>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;