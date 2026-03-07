import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';


const OrderPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const fish = location.state?.fish;

    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!fish) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                    <h2>Fish Not Found</h2>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        );
    }

    const pricePerKg = fish.price;
    const totalPrice = quantity * pricePerKg;

    const handleConfirmOrder = async () => {
        if (quantity < 1 || quantity > fish.availableQuantity) {
            setError('Invalid quantity selection');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('fisherDirectToken');
            const res = await fetch(`${API_BASE_URL}/orders/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fishId: fish.id,
                    orderKg: quantity
                })
            });

            if (res.ok) {
                alert('Order placed successfully');
                navigate('/customer/orders');
            } else {
                const data = await res.json();
                setError(data.message || 'Error placing order');
            }
        } catch (err) {
            console.error(err);
            setError('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in text-white relative z-10 p-8 max-w-5xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="text-white/60 hover:text-neon-400 text-lg transition-colors bg-transparent border-none cursor-pointer flex items-center gap-2">
                    <span>←</span> Back
                </button>
                <h2 className="text-3xl font-bold m-0 drop-shadow-md">Place Order</h2>
            </header>

            {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
                    {error}
                </div>
            )}

            <div className="flex gap-8 flex-wrap lg:flex-nowrap items-start">
                <div className="glass-card flex-1 min-w-[300px] overflow-hidden group">
                    <div className="h-[350px] bg-ocean-800/50 flex flex-col items-center justify-center text-8xl overflow-hidden relative border-b border-white/5">
                        <div className="absolute inset-0 bg-neon-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                        {fish.imageUrl ? (
                            <img src={fish.imageUrl} alt={fish.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            fish.image
                        )}
                    </div>
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-neon-400 mb-2">{fish.type}</h1>
                        <p className="text-white/70 text-lg mb-6 tracking-wide">Location: <strong className="text-white">{fish.location}</strong></p>
                        <div className="flex justify-between items-center py-6 border-t border-b border-white/10 mb-8">
                            <div>
                                <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Price per kg</p>
                                <span className="text-3xl font-bold text-white">₹{fish.price}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Available Stock</p>
                                <span className="text-3xl font-bold text-aqua-400 drop-shadow-md">{fish.availableQuantity} kg</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-4 text-white/90">Nutritional Information</h3>
                            <div className="bg-ocean-800/40 border border-white/5 p-6 rounded-xl grid grid-cols-2 gap-6">
                                <div>
                                    <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Protein</span>
                                    <strong className="text-lg font-semibold text-white/90">22g</strong>
                                </div>
                                <div>
                                    <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Omega-3 Fatty Acids</span>
                                    <strong className="text-lg font-semibold text-neon-400 drop-shadow-sm">High</strong>
                                </div>
                                <div>
                                    <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Calories</span>
                                    <strong className="text-lg font-semibold text-white/90">206 kcal <span className="text-sm font-normal text-white/60">/ 100g</span></strong>
                                </div>
                                <div>
                                    <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Vitamin D</span>
                                    <strong className="text-lg font-semibold text-white/90">Good source</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card flex-1 min-w-[300px] max-w-[400px] lg:sticky lg:top-24 p-8">
                    <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-md">Order Summary</h3>

                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Select Quantity (kg)</label>
                        <input
                            type="number"
                            min="1"
                            max={fish.availableQuantity}
                            value={quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setQuantity(isNaN(val) ? 1 : val);
                            }}
                            className="input-glass text-xl font-bold text-center !py-4"
                        />
                    </div>

                    <div className="bg-ocean-800/50 border border-white/5 p-6 rounded-xl mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white/70 font-medium">Total Price</span>
                            <span className="text-3xl font-bold text-neon-400 drop-shadow-sm">₹{totalPrice}</span>
                        </div>
                        <p className="text-xs text-white/40 text-right uppercase tracking-wider mt-2">Calculated dynamically</p>
                    </div>

                    <button
                        className="btn-neon-solid w-full !text-lg !py-4 uppercase tracking-widest"
                        onClick={handleConfirmOrder}
                        disabled={loading || quantity < 1 || quantity > fish.availableQuantity}
                    >
                        {loading ? 'Processing...' : 'Confirm Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
