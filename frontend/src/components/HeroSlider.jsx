import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = ({ language }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const intervalRef = useRef(null);

    const slides = [
        {
            bg: 'from-[#005E7B] to-[#008AAF]',
            titleKm: 'សូមស្វាគមន៍មកកាន់ Sabay Tenh',
            titleEn: 'Welcome to Sabay Tenh',
            subtitleKm: 'រកឃើញផលិតផលល្អបំផុត',
            subtitleEn: 'Discover the best products at great prices',
            emoji: '🛍️'
        },
        {
            bg: 'from-red-500 to-orange-500',
            titleKm: 'ការបញ្ចុះតម្លៃពិសេស',
            titleEn: 'Special Offers',
            subtitleKm: 'បញ្ចុះតម្លៃរហូតដល់ ៥០%',
            subtitleEn: 'Up to 50% off on selected items',
            emoji: '🔥'
        },
        {
            bg: 'from-emerald-500 to-teal-600',
            titleKm: 'ដឹកជញ្ជូនឥតគិតថ្លៃ',
            titleEn: 'Free Delivery',
            subtitleKm: 'សម្រាប់ការបញ្ជាទិញលើសពី $10',
            subtitleEn: 'On orders over $10',
            emoji: '🚚'
        }
    ];

    useEffect(() => {
        if (isAutoPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % slides.length);
            }, 4000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isAutoPlaying]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);
    const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);

    return (
        <div className="relative w-full mb-6 rounded-xl overflow-hidden group">
            <div className="relative h-36 sm:h-48 md:h-56 lg:h-64">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700 ease-in-out flex items-center ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                            }`}
                    >
                        <div className="px-6 sm:px-10 md:px-16 w-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className={`text-white text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        {language === 'km' ? slide.titleKm : slide.titleEn}
                                    </h2>
                                    <p className={`text-white/80 text-sm sm:text-base md:text-lg ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        {language === 'km' ? slide.subtitleKm : slide.subtitleEn}
                                    </p>
                                </div>
                                <span className="text-4xl sm:text-5xl md:text-6xl opacity-80 hidden sm:block">{slide.emoji}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
            >
                <ChevronRight size={18} />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'w-6 h-2 bg-white'
                                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
