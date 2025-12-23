import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import EmailIcon from '../icons/EmailIcon';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await api.post('/api/auth/forgot-password', { email });
            setMessage('Email sent! Please check your inbox (and spam folder) for the reset link.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100'>
            <div className='max-w-md w-full bg-white rounded-lg shadow-2xl p-8 space-y-6'>
                <h2 className='text-3xl font-bold text-center text-gray-800 tracking-wide'>
                    Forgot Password
                </h2>
                <p className='text-center text-gray-600 text-sm'>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div className='space-y-2'>
                        <label htmlFor="email" className='block text-sm font-medium text-gray-700'>
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EmailIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id='email'
                                required
                                placeholder='Enter your Email'
                                value={email}
                                className='w-full pl-10 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1B3C53] outline-none transition duration-150'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#1B3C53] transition duration-150 font-medium ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className='text-center'>
                    <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
