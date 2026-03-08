import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signupUser } from '../services/authService';

const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'buyer' | 'fisherman'>('buyer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { isAuthenticated, role: authRole } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to correct dashboard
    useEffect(() => {
        if (isAuthenticated) {
            if (authRole === 'buyer' || authRole === 'customer') navigate('/customerdashboard');
            else if (authRole === 'fisherman') navigate('/fishermandashboard');
            else if (authRole === 'admin') navigate('/admindashboard');
        }
    }, [isAuthenticated, authRole, navigate]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !phone || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await signupUser({ name, email, phone, password, role });
            // Successful signup redirects to login
            navigate('/');
        } catch (error) {
            setError("Could not connect to the server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
            <div className="glass-card w-full max-w-lg p-10 bg-ocean-900/50 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sea-400 to-transparent opacity-50"></div>

                <div className="text-center mb-8">
                    <div className="text-4xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] inline-block animate-float" style={{ animationDelay: '0.5s' }}>⚓</div>
                    <h1 className="text-3xl font-black text-white drop-shadow-md mb-2 tracking-tight">Join <span className="text-sea-400">FisherDirect</span></h1>
                    <p className="text-sm font-bold text-white/50 uppercase tracking-widest">Create Your Account</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm text-center font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="input-glass"
                            required
                        />
                    </div>

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
                        <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className="input-glass"
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="input-glass"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Confirm</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm"
                                className="input-glass"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Register As</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'buyer' | 'fisherman')}
                            className="input-glass"
                        >
                            <option value="buyer">BUYER (Customer)</option>
                            <option value="fisherman">FISHERMAN (Seller)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-sea-solid w-full mt-4 !py-4 uppercase tracking-widest text-sm"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 rounded-full border-2 border-ocean-900 border-t-transparent animate-spin"></span>
                                REGISTERING...
                            </span>
                        ) : 'CREATE ACCOUNT'}
                    </button>

                    <div className="mt-6 text-center text-xs font-bold text-white/50 tracking-widest uppercase">
                        Already have an account?{' '}
                        <Link to="/login" className="text-sea-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
