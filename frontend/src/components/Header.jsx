import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useSearch } from '../context/SearchContext';
import { translations } from '../context/translations';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

// Flag images from flagcdn.com
const FLAGS = {
    km: 'https://flagcdn.com/w40/kh.png',
    en: 'https://flagcdn.com/w40/us.png'
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const navigate = useNavigate();
    const { getItemCount, toggleCart } = useCart();
    const { language, toggleLanguage } = useLanguage();
    const { setSearchQuery } = useSearch();
    const t = translations[language];

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setLocalSearch(query);
        setSearchQuery(query);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (localSearch.trim()) {
            navigate('/');
        }
        setIsSearchOpen(false);
    };

    const clearSearch = () => {
        setLocalSearch('');
        setSearchQuery('');
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <a href="/" className="block">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-10 sm:h-12 w-auto hover:opacity-90 transition-opacity"
                            />
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="/"
                            className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-gray-700 hover:text-[#005E7B] text-sm font-medium transition-colors`}
                        >
                            {t.home}
                        </a>
                        <a
                            href="/sale"
                            className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-gray-700 hover:text-[#005E7B] text-sm font-medium transition-colors`}
                        >
                            {t.sale}
                        </a>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Search Toggle */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-[#005E7B] transition-colors"
                        >
                            <Search size={20} />
                        </button>

                        {/* Desktop Search Form */}
                        <form onSubmit={handleSearchSubmit} className="hidden md:block relative">
                            <input
                                type="text"
                                value={localSearch}
                                onChange={handleSearchChange}
                                placeholder={t.search || 'Search products...'}
                                className="w-64 lg:w-80 pl-10 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#005E7B] focus:border-transparent font-sans"
                            />
                            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            {localSearch && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </form>

                        {/* Language Toggle - Desktop with Flag */}
                        <button
                            onClick={toggleLanguage}
                            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                            title={language === 'km' ? 'Switch to English' : 'ប្តូរទៅខ្មែរ'}
                        >
                            <img
                                src={language === 'km' ? FLAGS.en : FLAGS.km}
                                alt={language === 'km' ? 'English' : 'Khmer'}
                                className="w-full h-full object-cover"
                            />
                        </button>

                        {/* Cart */}
                        <button
                            onClick={toggleCart}
                            className="relative p-2 text-gray-600 hover:text-[#005E7B] transition-colors"
                        >
                            <ShoppingCart size={20} />
                            {getItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#E1232E] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center font-sans">
                                    {getItemCount()}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-[#005E7B] transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Form */}
                {isSearchOpen && (
                    <div className="md:hidden py-3 border-t border-gray-100">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                value={localSearch}
                                onChange={handleSearchChange}
                                placeholder={t.search || 'Search products...'}
                                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005E7B] font-sans"
                                autoFocus
                            />
                            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            {localSearch && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-3">
                            <a
                                href="/"
                                className={`px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'} font-medium`}
                            >
                                {t.home}
                            </a>
                            <a
                                href="/sale"
                                className={`px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'} font-medium`}
                            >
                                {t.sale}
                            </a>

                            {/* Mobile Language Switcher with Flag */}
                            <button
                                onClick={() => {
                                    toggleLanguage();
                                    setIsMenuOpen(false);
                                }}
                                className="px-3 py-2 flex items-center gap-3 text-gray-700 hover:bg-gray-50 rounded-lg text-sm border-t border-gray-100 pt-3 mt-2"
                            >
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                                    <img
                                        src={language === 'km' ? FLAGS.en : FLAGS.km}
                                        alt={language === 'km' ? 'English' : 'Khmer'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className={language === 'km' ? 'font-sans' : 'font-khmer'}>
                                    {language === 'km' ? 'Switch to English' : 'ប្តូរទៅខ្មែរ'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;