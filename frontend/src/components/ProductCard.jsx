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
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded-full shadow-sm z-10 animate-pulse">
                        -{discount}%
                    </span>
                )}

                {/* Quick Add Button - Floating */}
                <button
                    className="absolute bottom-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#005E7B] hover:text-white z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                    }}
                >
                    <ShoppingCart size={18} />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={`${language === 'km' ? 'font-khmer' : 'font-sans'} text-[15px] font-medium text-gray-800 line-clamp-2 leading-tight group-hover:text-[#005E7B] transition-colors`}>
                        {language === 'km' ? product.nameKm : product.nameEn}
                    </h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoggedIn) { navigate('/user-login'); return; }
                            toggleWishlist(product._id);
                        }}
                        className={`transition-all duration-300 transform ${isInWishlist(product._id)
                            ? 'text-red-500 scale-110'
                            : 'text-gray-300 hover:text-red-400 hover:scale-110'
                            }`}
                    >
                        <Heart size={18} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                    </button>
                </div>

                <div className="mt-auto flex items-center justify-between">
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
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
