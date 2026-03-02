import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const tranId = params.get('tran_id');


        // Redirect to order success after 3 seconds
        const timer = setTimeout(() => {
            if (tranId) {
                navigate(`/order-success/${tranId}`);
            } else {
                navigate('/');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [location, navigate]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <div className="bg-white rounded-xl shadow-md p-8">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2 font-khmer">ការទូទាត់ជោគជ័យ!</h1>
                <p className="text-gray-600 mb-4 font-sans">Payment successful. Redirecting to order confirmation...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        </div>
    );
};

export default PaymentSuccess;