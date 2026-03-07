import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSeasonalRegulationActive } from '../utils/dateUtils';
import ProductDetails from './ProductDetails';
import OrderTracking from './OrderTracking';
import OrderChat from './OrderChat';

import axios from 'axios';

const CustomerDashboard: React.FC<{ defaultTab?: 'listings' | 'orders' }> = ({ defaultTab = 'listings' }) => {
    const [activeTab, setActiveTab] = useState<'listings' | 'orders'>(defaultTab);
    const [viewMode, setViewMode] = useState<'fresh' | 'value-added'>('fresh');

    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [activeOrderView, setActiveOrderView] = useState<{ type: 'track' | 'chat', orderId: string } | null>(null);

    const isRegulationActive = isSeasonalRegulationActive();

    useEffect(() => {
        if (isRegulationActive) {
            setViewMode('value-added');
        }
    }, [isRegulationActive]);

    const handleSubscribe = () => {
        alert("Success! You will be notified when new seasonal products arrive.");
    };

    const handleAddToCart = (product: any) => {
        setCart([...cart, product]);
    };

    const [listings, setListings] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchListings();
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('fisherDirectToken');
            const res = await axios.get('http://localhost:5000/api/orders/myorders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    };

    const fetchListings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/fish/list');
            if (res.ok) {
                const data = await res.json();
                const mappedListings = data.map((item: any) => ({
                    id: item._id,
                    type: item.fishType,
                    price: item.pricePerKg,
                    location: 'Local Port',
                    freshness: 'Fresh',
                    weight: item.quantity > 0 ? `${item.quantity}kg available` : 'Sold Out',
                    availableQuantity: item.quantity,
                    status: item.quantity > 0 ? item.status : 'stock_out',
                    imageUrl: item.imageUrl ? `http://localhost:5000${item.imageUrl}` : '',
                    image: item.imageUrl ? '' : '🐟'
                }));
                setListings(mappedListings);
            }
        } catch (err) {
            console.error("Failed to fetch listings", err);
        }
    };

    const handleBuyNow = (item: any) => {
        navigate(`/order/${item.id}`, { state: { fish: item } });
    };

    const specialListings = [
        { id: 101, type: 'Dried Seer Fish', price: 300, location: 'Marina', shelfLife: '6 months', weight: '500g', image: '🐠', bulk: true, prep: '10 Nov 2025' },
        { id: 102, type: 'Prawn Pickle', price: 250, location: 'Kasimedu', shelfLife: '3 months', weight: '250g', image: '🏺', bulk: false, prep: '12 Nov 2025' },
        { id: 103, type: 'Fish Powder', price: 150, location: 'Neelankarai', shelfLife: '4 months', weight: '200g', image: '🧂', bulk: true, prep: '05 Nov 2025' },
        { id: 104, type: 'Salted Mackerel', price: 200, location: 'Besant Nagar', shelfLife: '5 months', weight: '1kg', image: '🐟', bulk: true, prep: '01 Nov 2025' },
    ];

    return (
        <div className="animate-fade-in p-8 text-white relative z-10">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-white drop-shadow-md">Fresh Market</h1>
                    <p className="text-white/70 tracking-wide mt-1">Direct from the boats to your doorstep</p>
                </div>
                <div className="flex gap-4 items-center">
                    {isRegulationActive && (
                        <div className="bg-neon-400/20 text-neon-400 px-4 py-2 rounded-full text-sm font-bold mr-4 border border-neon-400/50 flex flex-row items-center gap-2 shadow-[0_0_10px_rgba(0,245,255,0.2)]">
                            <span>✨ Off-Season Mode</span>
                            <button onClick={handleSubscribe} className="bg-neon-400 text-ocean-900 rounded-full w-6 h-6 flex items-center justify-center text-xs ml-2 hover:scale-110 transition-transform">🔔</button>
                        </div>
                    )}
                    <button className={activeTab === 'listings' ? 'btn-neon-solid' : 'btn-neon'} onClick={() => setActiveTab('listings')}>Browse Listings</button>
                    <button className={activeTab === 'orders' ? 'btn-neon-solid' : 'btn-neon'} onClick={() => setActiveTab('orders')}>My Orders</button>
                    <div className="relative cursor-pointer ml-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors" onClick={() => alert(`Your cart has ${cart.length} items.`)}>
                        <span className="text-2xl drop-shadow-md">🛒</span>
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold shadow-lg">
                                {cart.length}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {activeTab === 'listings' && (
                <div className="marketplace">
                    {isRegulationActive && (
                        <div className="mb-8 flex gap-4 justify-center">
                            <button
                                className={viewMode === 'fresh' ? 'btn-neon-solid rounded-full px-8' : 'btn-neon rounded-full px-8'}
                                onClick={() => setViewMode('fresh')}
                            >
                                Fresh Fish 🐟
                            </button>
                            <button
                                className={viewMode === 'value-added' ? 'btn-neon-solid rounded-full px-8' : 'btn-neon rounded-full px-8'}
                                onClick={() => setViewMode('value-added')}
                            >
                                Special Products ✨
                            </button>
                        </div>
                    )}
                    <section className="glass-card p-6 mb-8 flex gap-6 flex-wrap items-center justify-between">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">
                                {viewMode === 'fresh' ? 'Fish Type' : 'Product Type'}
                            </label>
                            <select
                                className="input-glass"
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                {viewMode === 'fresh' ? (
                                    <>
                                        <option>Seer Fish</option>
                                        <option>Pomfret</option>
                                        <option>Snapper</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Dried fish">Dried Fish</option>
                                        <option value="Fish pickle">Fish Pickle</option>
                                        <option value="Fish powder">Fish Powder</option>
                                        <option value="Salted fish">Salted Fish</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Price Range</label>
                            <select className="input-glass">
                                <option>Any Price</option>
                                <option>Below ₹400</option>
                                <option>₹400 - ₹600</option>
                                <option>Above ₹600</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Location</label>
                            <select className="input-glass">
                                <option>All Locations</option>
                                <option>Marina</option>
                                <option>Kasimedu</option>
                                <option>Besant Nagar</option>
                            </select>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {viewMode === 'fresh' ? (
                            listings.map((item) => (
                                <div key={item.id} className="glass-card overflow-hidden flex flex-col group">
                                    <div className="h-48 bg-ocean-800/50 flex items-center justify-center text-7xl overflow-hidden relative border-b border-white/5">
                                        <div className="absolute inset-0 bg-neon-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            item.image
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-neon-400 transition-colors">{item.type}</h3>
                                            <span className="bg-neon-400/20 text-neon-400 border border-neon-400/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{item.freshness}</span>
                                        </div>
                                        <p className="text-white/60 text-sm mb-4">{item.weight} • {item.location}</p>
                                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                                            <span className="text-2xl font-bold text-white">₹{item.price}<span className="text-sm font-normal text-white/50">/kg</span></span>
                                            <div className="flex gap-2 items-center">
                                                {item.status === 'stock_out' ? (
                                                    <button className="btn-neon-solid" disabled>
                                                        Stock Out
                                                    </button>
                                                ) : (
                                                    <button className="btn-neon-solid" onClick={() => handleBuyNow(item)}>
                                                        Buy Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            specialListings
                                .filter(item => selectedCategory === 'All' || item.type.includes(selectedCategory.replace('fish', '').trim())) // Simple mock filter logic
                                .map((item) => (
                                    <div key={item.id} className="glass-card overflow-hidden flex flex-col group border-sea-500/30">
                                        <div className="h-48 bg-ocean-800/50 flex items-center justify-center text-7xl relative">
                                            <div className="absolute inset-0 bg-sea-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                                            {item.image}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-xl font-bold text-sea-500 group-hover:text-aqua-400 transition-colors">{item.type}</h3>
                                                <span className="bg-sea-500/20 text-sea-500 border border-sea-500/30 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Shelf: {item.shelfLife}</span>
                                            </div>
                                            <p className="text-white/60 text-sm mb-1"><strong>Weight:</strong> {item.weight}</p>
                                            <p className="text-white/60 text-sm mb-4"><strong>Prep Date:</strong> {item.prep}</p>
                                            {item.bulk && (
                                                <div className="mb-4">
                                                    <span className="bg-aqua-400/20 text-aqua-400 border border-aqua-400/20 px-2 py-1 rounded text-xs">Bulk Order Available</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                                                <span className="text-2xl font-bold text-sea-500">₹{item.price}</span>
                                                <button
                                                    className="btn-neon text-sm"
                                                    onClick={() => setSelectedProduct(item)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="orders-section animate-fade-in relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-md">Your Orders</h2>
                    {orders.length === 0 ? (
                        <div className="glass-card p-12 text-center text-white/50">
                            <span className="text-4xl block mb-4">📦</span>
                            <p className="text-lg">No orders found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="glass-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:-translate-y-1 transition-transform">
                                    <div>
                                        <h4 className="text-xl font-bold text-neon-400 mb-1">Order #{order._id.substring(order._id.length - 6)}</h4>
                                        <p className="text-white/80 text-sm">
                                            {order.quantity}kg {order.fishId?.fishType || 'Unknown'} <span className="mx-2 opacity-30">•</span> Total: <strong className="text-white">₹{order.totalPrice}</strong>
                                        </p>
                                        <p className="text-white/40 text-xs mt-2 uppercase tracking-wider">
                                            Date: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right sm:text-right w-full sm:w-auto">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-sea-500/20 text-sea-400 border border-sea-500/30'}`}>
                                            {order.status}
                                        </span>
                                        <div className="flex gap-3 justify-end">
                                            <button className="btn-neon px-4 py-1.5 text-sm" onClick={() => setActiveOrderView({ type: 'track', orderId: order._id })}>Track</button>
                                            <button className="bg-transparent text-white border border-white/20 px-4 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold" onClick={() => setActiveOrderView({ type: 'chat', orderId: order._id })}>Chat</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {selectedProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 1000, overflowY: 'auto' }}>
                    <ProductDetails
                        product={selectedProduct}
                        onBack={() => setSelectedProduct(null)}
                        onAddToCart={handleAddToCart}
                    />
                </div>
            )}

            {activeOrderView && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 1000, overflowY: 'auto' }}>
                    {activeOrderView.type === 'track' ? (
                        <OrderTracking orderId={activeOrderView.orderId} onBack={() => setActiveOrderView(null)} />
                    ) : (
                        <OrderChat orderId={activeOrderView.orderId} onBack={() => setActiveOrderView(null)} />
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
