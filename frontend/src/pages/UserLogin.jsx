import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const EyeIcon = ({ open }) => (
    open ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    )
);

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const getFirebaseError = (code) => {
    switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        default:
            return 'Something went wrong. Please try again.';
    }
};

const UserLogin = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, signInWithEmail, loading, isLoggedIn } = useUser();
    const { language } = useLanguage();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const km = language === 'km';

    // Fixed: Redirect if already logged in using useEffect
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/profile');
        }
    }, [isLoggedIn, navigate]);

    if (isLoggedIn) return null;

    const handleChange = (e) => {
        setError('');
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError(km ? 'សូមបំពេញព័ត៌មានទាំងអស់' : 'Please fill in all fields.');
            return;
        }
        setSubmitting(true);
        setError('');
        const result = await signInWithEmail(form.email, form.password);
        if (result.success) {
            navigate('/profile');
        } else {
            setError(getFirebaseError(result.code));
        }
        setSubmitting(false);
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const result = await signInWithGoogle();
        if (result.success) {
            navigate('/profile');
        } else {
            setError(km ? 'មានបញ្ហាជាមួយ Google' : 'Google sign-in failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-[#005E7B] via-teal-400 to-cyan-400" />
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#005E7B] to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <h1 className={`text-2xl font-bold text-gray-900 ${km ? 'font-khmer' : ''}`}>
                                {km ? 'ចូលគណនី' : 'Welcome back'}
                            </h1>
                            <p className={`text-sm text-gray-400 mt-1 ${km ? 'font-khmer' : ''}`}>
                                {km ? 'ចូលទៅកាន់គណនីរបស់អ្នក' : 'Sign in to your account to continue'}
                            </p>
                        </div>
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${km ? 'font-khmer' : ''}`}>
                                    {km ? 'អ៊ីមែល' : 'Email address'}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder={km ? 'email@example.com' : 'you@example.com'}
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#005E7B]/30 focus:border-[#005E7B] transition-all"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className={`text-sm font-medium text-gray-700 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'ពាក្យសម្ងាត់' : 'Password'}
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder={km ? 'ពាក្យសម្ងាត់' : 'Enter your password'}
                                        autoComplete="current-password"
                                        className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#005E7B]/30 focus:border-[#005E7B] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting || loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#005E7B] to-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:from-[#004d66] hover:to-teal-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting
                                    ? (km ? 'កំពុងចូល...' : 'Signing in...')
                                    : (km ? 'ចូល' : 'Sign in')}
                            </button>
                        </form>
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                {km ? 'ឬ' : 'or'}
                            </span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading || submitting}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 group"
                        >
                            <GoogleIcon />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                {loading && !submitting
                                    ? (km ? 'កំពុងចូល...' : 'Signing in...')
                                    : (km ? 'ចូលដោយប្រើ Google' : 'Continue with Google')}
                            </span>
                        </button>
                        <p className={`text-center text-sm text-gray-500 mt-6 ${km ? 'font-khmer' : ''}`}>
                            {km ? 'មិនទាន់មានគណនី?' : "Don't have an account?"}{' '}
                            <Link to="/register" className="font-semibold text-[#005E7B] hover:text-teal-600 transition-colors">
                                {km ? 'ចុះឈ្មោះ' : 'Create one'}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
