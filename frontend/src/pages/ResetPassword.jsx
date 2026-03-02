import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyResetCode, confirmReset } = useUser();
    const { language } = useLanguage();
    const km = language === 'km';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('verifying'); // verifying, ready, loading, success, error
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const oobCode = searchParams.get('oobCode');

    useEffect(() => {
        const verifyCode = async () => {
            if (!oobCode) {
                setStatus('error');
                setError(km ? 'តំណភ្ជាប់មិនត្រឹមត្រូវ' : 'Invalid or missing reset link.');
                return;
            }

            try {
                const email = await verifyResetCode(oobCode);
                setUserEmail(email);
                setStatus('ready');
            } catch (err) {
                console.error(err);
                setStatus('error');
                setError(km ? 'តំណភ្ជាប់បានផុតកំណត់ ឬត្រូវបានប្រើរួចហើយ' : 'Link expired or already used.');
            }
        };
        verifyCode();
    }, [oobCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError(km ? 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ' : 'Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError(km ? 'ពាក្យសម្ងាត់មិនត្រូវគ្នា' : 'Passwords do not match.');
            return;
        }

        setStatus('loading');
        const result = await confirmReset(oobCode, password);

        if (result.success) {
            setStatus('success');
            setTimeout(() => navigate('/user-login'), 3000);
        } else {
            setStatus('ready');
            setError(km ? 'មានបញ្ហាក្នុងការប្តូរពាក្យសម្ងាត់' : 'Failed to update password. Please try again.');
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
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                            <h1 className={`text-2xl font-bold text-gray-900 ${km ? 'font-khmer' : ''}`}>
                                {km ? 'កំណត់ពាក្យសម្ងាត់ថ្មី' : 'New Password'}
                            </h1>
                            <p className={`text-sm text-gray-400 mt-1 ${km ? 'font-khmer' : ''}`}>
                                {status === 'verifying'
                                    ? (km ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Verifying your link...')
                                    : status === 'success'
                                        ? (km ? 'ប្តូរពាក្យសម្ងាត់បានជោគជ័យ' : 'Password changed successfully!')
                                        : (km ? `សម្រាប់: ${userEmail}` : `For: ${userEmail}`)}
                            </p>
                        </div>

                        {status === 'verifying' && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005E7B]"></div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center space-y-6">
                                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm">
                                    {km ? 'ពាក្យសម្ងាត់របស់អ្នកត្រូវបានប្តូររួចរាល់។ អ្នកនឹងត្រូវបានបញ្ជូនទៅកាន់ទំព័រចូលក្នុងពេលឆាប់ៗនេះ។' : 'Your password has been updated. You will be redirected to the login page shortly.'}
                                </div>
                                <button
                                    onClick={() => navigate('/user-login')}
                                    className="w-full py-3 rounded-xl bg-[#005E7B] text-white font-semibold text-sm shadow-lg hover:bg-[#004d66] transition-all"
                                >
                                    {km ? 'ទៅកាន់ទំព័រចូល' : 'Go to Login Now'}
                                </button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="text-center space-y-6">
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm">
                                    {error}
                                </div>
                                <button
                                    onClick={() => navigate('/user-login')}
                                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-all"
                                >
                                    {km ? 'ត្រឡប់ទៅការចូល' : 'Back to Login'}
                                </button>
                            </div>
                        )}

                        {(status === 'ready' || status === 'loading') && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#005E7B]/30 focus:border-[#005E7B] transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <EyeIcon open={showPassword} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${km ? 'font-khmer' : ''}`}>
                                        {km ? 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី' : 'Confirm New Password'}
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#005E7B]/30 focus:border-[#005E7B] transition-all"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#005E7B] to-teal-500 text-white font-semibold text-sm shadow-lg hover:shadow-teal-300 transition-all disabled:opacity-60"
                                >
                                    {status === 'loading' ? (km ? 'កំពុងរក្សាទុក...' : 'Updating...') : (km ? 'រក្សាទុកពាក្យសម្ងាត់ថ្មី' : 'Reset Password')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
