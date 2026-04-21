import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/login', formData);
            if (res.data.success) {
                toast.success('Logged in successfully');
                login(res.data.user, res.data.token);
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
            <div className="glass-panel w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-gray-500 mt-2">Sign in to your account to continue</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
                        </div>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all hover:-translate-y-0.5">
                        Sign In
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">Don't have an account? </span>
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">Register now</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
