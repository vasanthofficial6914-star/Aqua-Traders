import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, role, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to correct dashboard
    useEffect(() => {
        if (isAuthenticated) {
            if (role === 'buyer' || role === 'customer') navigate('/customerdashboard');
            else if (role === 'fisherman') navigate('/fishermandashboard');
            else if (role === 'admin') navigate('/admindashboard');
        }
    }, [isAuthenticated, role, navigate]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser({ email, password });

            // Assuming data contains token and user body:
            login(data, data.token);

            // Redirect based on role returned from DB
            const userRole = data.role;
            if (userRole === 'buyer' || userRole === 'customer') {
                navigate('/customerdashboard');
            } else if (userRole === 'fisherman') {
                navigate('/fishermandashboard');
            } else if (userRole === 'admin') {
                navigate('/admindashboard');
            }
        } catch (error) {
            setError("Could not connect to the server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in flex items-center justify-center min-h-[calc(100vh-80px)] p-4 md:p-8">
            <div className="glass-card w-full max-w-5xl bg-ocean-900/50 border-white/10 relative overflow-hidden flex flex-col md:flex-row shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                {/* Left Side: Welcome and Login Form */}
                <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative z-10 bg-ocean-900/40 backdrop-blur-sm">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-neon-400 to-transparent opacity-50"></div>
                    
                    <div className="text-center mb-10">
                        <div className="text-4xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] inline-block animate-float">🌊</div>
                        <h1 className="text-3xl font-black text-white drop-shadow-md mb-2 tracking-tight">WELCOME TO மீனவன்</h1>
                        <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm text-center font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="input-glass"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="input-glass"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-neon-solid w-full mt-4 !py-4 uppercase tracking-widest text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 rounded-full border-2 border-ocean-900 border-t-transparent animate-spin"></span>
                                    AUTHENTICATING...
                                </span>
                            ) : 'LOGIN SECURELY'}
                        </button>

                        <div className="mt-8 text-center text-xs font-bold text-white/50 tracking-widest uppercase">
                            New to மீனவன்?{' '}
                            <Link to="/signup" className="text-neon-400 hover:text-white transition-colors">
                                Create Account
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Right Side: AI Picture */}
                <div className="w-full md:w-1/2 relative hidden md:block">
                    <img 
                        src="/ai_picture.png" 
                        alt="Meenavan AI Art" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Overlay to blend image nicely with the dark aesthetic */}
                    <div className="absolute inset-0 bg-gradient-to-r from-ocean-900/90 via-transparent to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
