import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const ProductCard = ({ product, index }) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { isLoggedIn } = useUser();
    const km = language === 'km';

    const getDiscountPercentage = (price, salePrice) => {
        if (!price || !salePrice) return 0;
        return Math.round(((price - salePrice) / price) * 100);
    };

    const discount = getDiscountPercentage(product.price, product.salePrice);

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate('/user-login');
            return;
        }
        toggleWishlist(product._id);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, 1);
    };

    return (
        <div
            onClick={() => navigate(`/product/${product.slug}`)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full group"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="relative pb-[100%] bg-gray-100 overflow-hidden">
                <img
                    src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_300/') || 'https://via.placeholder.com/300x300'}
                    alt={km ? product.nameKm : product.nameEn}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Sale Badge */}
                {product.onSale && (
                    <span className={`absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full shadow-sm z-10 ${km ? 'font-khmer' : 'font-sans'}`}>
                        {discount > 0 ? `-${discount}%` : (km ? 'បញ្ចុះតម្លៃ' : 'Sale')}
                    </span>
                )}

                {/* Wishlist Heart */}
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-2 left-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10 hover:bg-white transition-colors shadow-sm"
                >
                    <Heart
                        size={16}
                        className={`transition-colors ${isInWishlist(product._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                    />
                </button>
            </div>

            <div className="p-3 flex flex-col flex-grow">
                <h3 className={`${km ? 'font-khmer' : 'font-sans'} text-sm sm:text-base font-medium text-gray-800 mb-1.5 line-clamp-2 leading-snug group-hover:text-[#005E7B] transition-colors`}>
                    {km ? product.nameKm : product.nameEn}
                </h3>

                {product.description && (
                    <p className="text-[11px] text-gray-400 mb-2 line-clamp-1 font-sans">
                        {product.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex flex-col">
                        {product.salePrice ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1.5">
                                <span className="font-sans text-base font-bold text-red-600">${product.salePrice}</span>
                                <span className="font-sans text-[11px] text-gray-400 line-through decoration-gray-300">${product.price}</span>
                            </div>
                        ) : (
                            <span className="font-sans text-base font-bold text-gray-800">${product.price}</span>
                        )}
                    </div>

                    <button
                        className="w-9 h-9 flex items-center justify-center bg-[#005E7B] text-white rounded-lg hover:bg-[#004b63] hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
                        onClick={handleAddToCart}
                        title={km ? 'ដាក់ក្នុងកន្ត្រក' : 'Add to cart'}
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
