import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Send, Clock, Facebook, MessageCircle, Youtube, Instagram } from 'lucide-react';

const Contact = () => {
    const { language } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {language === 'km' ? 'ទំនាក់ទំនងមកយើងខ្ញុំ' : 'Get in Touch'}
                    </h1>
                    <p className={`text-lg text-gray-600 max-w-2xl mx-auto ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {language === 'km'
                            ? 'យើងខ្ញុំរីករាយក្នុងការជួយអ្នកគ្រប់ពេលវេលា សូមទំនាក់ទំនងមកយើងខ្ញុំតាមរយៈ'
                            : 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'}
                    </p>
                </div>

                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Phone Card */}
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center group">
                        <div className="w-16 h-16 bg-[#005E7B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Phone size={32} className="text-[#005E7B]" />
                        </div>
                        <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' ? 'ទូរស័ព្ទ' : 'Phone'}
                        </h3>
                        <p className="text-gray-600 font-sans mb-1">+855 12 345 678</p>
                        <p className="text-gray-600 font-sans">+855 98 765 432</p>
                        <p className="text-sm text-[#005E7B] font-sans mt-3 hover:underline cursor-pointer">Call us now</p>
                    </div>

                    {/* Email Card */}
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center group">
                        <div className="w-16 h-16 bg-[#005E7B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Mail size={32} className="text-[#005E7B]" />
                        </div>
                        <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' ? 'អ៊ីមែល' : 'Email'}
                        </h3>
                        <p className="text-gray-600 font-sans mb-1">info@yourshop.com</p>
                        <p className="text-gray-600 font-sans">support@yourshop.com</p>
                        <p className="text-sm text-[#005E7B] font-sans mt-3 hover:underline cursor-pointer">Send us email</p>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center group">
                        <div className="w-16 h-16 bg-[#005E7B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <MapPin size={32} className="text-[#005E7B]" />
                        </div>
                        <h3 className={`text-xl font-semibold text-gray-800 mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' ? 'អាសយដ្ឋាន' : 'Address'}
                        </h3>
                        <p className="text-gray-600 font-sans">#123, Preah Monivong Blvd</p>
                        <p className="text-gray-600 font-sans">Phnom Penh, Cambodia</p>
                        <p className="text-sm text-[#005E7B] font-sans mt-3 hover:underline cursor-pointer">Get directions</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' ? 'ផ្ញើសារមកយើង' : 'Send us a Message'}
                        </h2>

                        {submitted ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send size={32} className="text-green-600" />
                                </div>
                                <h3 className={`text-xl font-semibold text-green-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {language === 'km' ? 'ផ្ញើសារជោគជ័យ!' : 'Message Sent!'}
                                </h3>
                                <p className={`text-green-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {language === 'km'
                                        ? 'សូមអរគុណសម្រាប់ការផ្ញើសារ។ យើងនឹងទាក់ទងទៅអ្នកវិញឆាប់ៗ'
                                        : 'Thank you for your message. We\'ll get back to you soon.'}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                            {language === 'km' ? 'ឈ្មោះ' : 'Full Name'} *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005E7B] focus:border-transparent font-sans transition-shadow"
                                            placeholder={language === 'km' ? 'សូមបញ្ចូលឈ្មោះ' : 'John Doe'}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                            {language === 'km' ? 'អ៊ីមែល' : 'Email'} *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005E7B] focus:border-transparent font-sans transition-shadow"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                            {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005E7B] focus:border-transparent font-sans transition-shadow"
                                            placeholder="+855 12 345 678"
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                            {language === 'km' ? 'ប្រធានបទ' : 'Subject'} *
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005E7B] focus:border-transparent font-sans transition-shadow"
                                            placeholder={language === 'km' ? 'សូមបញ្ចូលប្រធានបទ' : 'How can we help?'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        {language === 'km' ? 'សារ' : 'Message'} *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005E7B] focus:border-transparent font-sans transition-shadow resize-none"
                                        placeholder={language === 'km' ? 'សូមបញ្ចូលសារ...' : 'Write your message here...'}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#005E7B] text-white py-4 rounded-xl hover:bg-[#004b63] transition-colors font-sans font-medium flex items-center justify-center gap-2 text-lg"
                                >
                                    <Send size={20} />
                                    {language === 'km' ? 'ផ្ញើសារ' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Business Hours & Social Media */}
                    <div className="space-y-8">
                        {/* Business Hours - 24/7 */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-[#005E7B]/10 rounded-xl flex items-center justify-center">
                                    <Clock size={28} className="text-[#005E7B]" />
                                </div>
                                <h2 className={`text-2xl font-bold text-gray-800 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {language === 'km' ? 'ម៉ោងបើកប្រតិបត្តិការ' : 'Business Hours'}
                                </h2>
                            </div>

                            <div className="bg-gradient-to-r from-[#005E7B] to-[#0078A0] rounded-xl p-6 text-white">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <Clock size={32} />
                                    <h3 className={`text-3xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        24/7
                                    </h3>
                                </div>
                                <p className={`text-center text-lg opacity-90 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {language === 'km'
                                        ? 'បើកសេវាកម្ម ២៤ ម៉ោង រៀងរាល់ថ្ងៃ'
                                        : 'Open 24 hours, 7 days a week'}
                                </p>
                                <div className="flex justify-center gap-4 mt-4">
                                    <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                                        Mon - Sun
                                    </span>
                                    <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                                        00:00 - 24:00
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <p className={`text-gray-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {language === 'km'
                                        ? 'យើងត្រៀមបម្រើអ្នកគ្រប់ពេលវេលា'
                                        : 'We are always ready to assist you'}
                                </p>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                {language === 'km' ? 'តាមដានយើងតាមបណ្តាញសង្គម' : 'Follow Us on Social Media'}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a href="#" className="flex items-center gap-4 p-5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                                    <Facebook size={32} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                    <span className={`font-sans font-medium text-gray-700 text-base sm:text-lg ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        Facebook
                                    </span>
                                </a>
                                <a href="#" className="flex items-center gap-4 p-5 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors group">
                                    <MessageCircle size={32} className="text-sky-500 group-hover:scale-110 transition-transform" />
                                    <span className={`font-sans font-medium text-gray-700 text-base sm:text-lg ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        Telegram
                                    </span>
                                </a>
                                <a href="#" className="flex items-center gap-4 p-5 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group">
                                    <Youtube size={32} className="text-red-600 group-hover:scale-110 transition-transform" />
                                    <span className={`font-sans font-medium text-gray-700 text-base sm:text-lg ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        YouTube
                                    </span>
                                </a>
                                <a href="#" className="flex items-center gap-4 p-5 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group">
                                    <Instagram size={32} className="text-pink-600 group-hover:scale-110 transition-transform" />
                                    <span className={`font-sans font-medium text-gray-700 text-base sm:text-lg ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                        Instagram
                                    </span>
                                </a>
                            </div>
                        </div>
                        {/* Map - Yeung Shi Group Location */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-80">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29726.890938815544!2d104.91330559999999!3d11.5310592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310950e6f508d97f%3A0x3fe425c8d8a84794!2sYeung%20Shi%20Group%20(YSG)!5e1!3m2!1sen!2skh!4v1772095143278!5m2!1sen!2skh"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Yeung Shi Group Location"
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;