import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import FishermanDashboard from './components/FishermanDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import GovernmentSchemes from './components/GovernmentSchemes';
import ProductDetails from './components/ProductDetails';
import OrderTracking from './components/OrderTracking';
import AIAssistant from './components/AIAssistant';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderPage from './pages/OrderPage';
import HardwareDashboard from './pages/HardwareDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

const Navigation = () => {
  const { role, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide specific controls on login and signup pages
  const isAuthPage = location.pathname === '/' || location.pathname === '/signup';

  const handleLogoClick = () => {
    if (role === 'buyer' || role === 'customer') navigate('/customerdashboard');
    else if (role === 'fisherman') navigate('/dashboard');
    else if (role === 'admin') navigate('/admindashboard');
    else navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-[100] px-8 py-4 flex justify-between items-center">
      <div
        className="font-extrabold text-2xl text-neon-400 cursor-pointer drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] hover:scale-105 transition-transform"
        onClick={handleLogoClick}
      >
        மீனவன்
      </div>
      <div className="flex gap-6 items-center">
        {location.pathname !== '/schemes' && (
          <button className="text-white font-medium hover:text-neon-400 transition-colors drop-shadow-md" onClick={() => navigate('/schemes')}>
            Programs & Schemes
          </button>
        )}
        {isAuthenticated && !isAuthPage ? (
          <>
            {user && <span className="font-semibold text-white/90 mr-2 drop-shadow-md">Hi, {user.name}</span>}
            <button className="btn-neon" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

const AppContent = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <div className="bubbles-container">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="bubble" style={{ left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 8 + 4}s`, animationDelay: `${Math.random() * 5}s`, width: `${Math.random() * 20 + 5}px`, height: `${Math.random() * 20 + 5}px` }}></div>
        ))}
      </div>

      <Navigation />

      <main className="flex-1 w-full px-4 md:px-8 z-10">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/schemes" element={<GovernmentSchemes onBack={() => navigate(-1)} />} />

          <Route element={<PrivateRoute allowedRole={["customer", "buyer"]} />}>
            <Route path="/customerdashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders" element={<CustomerDashboard defaultTab="orders" />} />
            <Route path="/order/:fishId" element={<OrderPage />} />
            <Route path="/products" element={<ProductDetails product={{ id: 1, type: '', price: 0, location: '', image: '' } as any} onBack={() => navigate(-1)} onAddToCart={() => { }} />} />
            <Route path="/orders" element={<OrderTracking orderId="DUMMY-123" onBack={() => navigate(-1)} />} />
          </Route>

          <Route element={<PrivateRoute allowedRole="fisherman" />}>
            <Route path="/dashboard" element={<FishermanDashboard />} />
            <Route path="/dashboard/hardware" element={<HardwareDashboard />} />
            {/* Backward compatibility for old link */}
            <Route path="/fishermandashboard" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route element={<PrivateRoute allowedRole="admin" />}>
            <Route path="/admindashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="relative mt-auto z-10">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-neon-400/50 to-transparent"></div>
        <div className="p-8 bg-ocean-900/80 backdrop-blur-md text-white text-center">
          <p className="text-white/80 text-sm font-medium tracking-wide">© 2026 மீனவன். Empowering Fishermen, Delivering Freshness.</p>
        </div>
      </footer>

      <AIAssistant role={role} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
