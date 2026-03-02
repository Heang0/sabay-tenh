import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, index = 0 }) => {
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

    const isFirstRow = index < 12;

    return (
        <motion.div
            initial={{ opacity: 0, y: isFirstRow ? 15 : 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ y: -4 }}
            transition={{
                duration: 0.4,
                delay: isFirstRow ? (index % 4) * 0.05 : 0,
                ease: "easeOut"
            }}
            style={{ willChange: "transform, opacity" }}
            onClick={() => navigate(`/product/${product.slug}`)}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer flex flex-col h-full group"
        >
            {/* Product Image */}
            <div className="relative pb-[100%] bg-gray-100 overflow-hidden flex-shrink-0">
                <img
                    src={product.image?.replace('/upload/', '/upload/f_auto,q_auto,w_500/') || 'https://via.placeholder.com/500x500'}
                    alt={product.nameEn}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {product.onSale && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded-full shadow-sm z-20 animate-pulse">
                        -{discount}%
                    </span>
                )}

                {/* Wishlist Button - Top Left */}
                <button
                    onClick={handleWishlistClick}
                    className={`absolute top-2 left-2 z-30 p-1.5 rounded-full transition-all duration-300 shadow-sm ${isInWishlist(product._id)
                            ? 'bg-red-50 text-red-500 scale-110'
                            : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:scale-110'
                        }`}
                >
                    <Heart size={16} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-3 flex flex-col flex-grow">
                <h3 className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-[15px] font-medium text-gray-800 line-clamp-2 leading-tight group-hover:text-[#005E7B] transition-colors mb-2`}>
                    {language === 'km' ? product.nameKm : product.nameEn}
                </h3>

                <div className="mt-auto flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        {product.salePrice ? (
                            <div className="flex items-center gap-1.5">
                                <span className="font-sans text-[15px] font-bold text-red-600">
                                    ${product.salePrice}
                                </span>
                                <span className="font-sans text-[11px] text-gray-400 line-through">
                                    ${product.price}
                                </span>
                            </div>
                        ) : (
                            <span className="font-sans text-[15px] font-bold text-gray-800">
                                ${product.price}
                            </span>
                        )}
                    </div>

                    {/* Persistent Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="p-2 bg-[#005E7B] text-white rounded-lg shadow-sm hover:bg-[#004b63] active:scale-95 transition-all duration-200"
                        title={language === 'km' ? 'បន្ថែមទៅកន្ត្រក' : 'Add to Cart'}
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
