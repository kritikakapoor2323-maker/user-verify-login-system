import { useState, useContext } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [otp, setOtp] = useState('');
    
    const email = location.state?.email;

    if (!email) {
        return <Navigate to="/register" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/verify-otp', { email, otp });
            if (res.data.success) {
                toast.success('Account verified successfully!');
                login(null, res.data.token); // We don't have user data here, AuthContext will fetch it
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
            <div className="glass-panel w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Verify your email</h2>
                    <p className="text-sm text-gray-500 mt-2">We've sent a 6-digit code to <span className="font-medium text-gray-800">{email}</span></p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input 
                            type="text" 
                            required 
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            className="block w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-300" 
                        />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all hover:-translate-y-0.5">
                        Verify Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
