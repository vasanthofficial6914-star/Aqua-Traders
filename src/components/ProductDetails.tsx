import React from 'react';

interface Product {
    id: number;
    type: string;
    price: number;
    location: string;
    freshness?: string;
    shelfLife?: string;
    weight: string;
    image: string;
    prep?: string;
}

interface ProductDetailsProps {
    product: Product;
    onBack: () => void;
    onAddToCart: (product: Product) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart }) => {
    const handlePayNow = () => {
        alert(`Payment successful for ${product.type}! Your order is being processed.`);
        onBack();
    };

    return (
        <div className="animate-fade-in p-8 text-white">
            <button
                onClick={onBack}
                className="bg-transparent border-none text-neon-400 hover:text-white transition-colors cursor-pointer mb-8 text-sm font-bold uppercase tracking-widest flex items-center gap-2 group"
            >
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> BACK TO MARKET
            </button>

            <div className="glass-card grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 p-0 overflow-hidden bg-ocean-900/50 border-white/10 relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sea-400 to-transparent opacity-50"></div>

                <div className="bg-ocean-800/50 flex items-center justify-center text-[10rem] min-h-[400px] border-r border-white/5 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-neon-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    <span className="group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        {product.image}
                    </span>
                </div>

                <div className="p-8 pb-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-white drop-shadow-md mb-3 tracking-tight">{product.type}</h1>
                            <div className="flex gap-2 flex-wrap">
                                {product.freshness && (
                                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                        {product.freshness}
                                    </span>
                                )}
                                {product.shelfLife && (
                                    <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                                        Shelf Life: {product.shelfLife}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-4xl font-black text-neon-400 drop-shadow-[0_0_15px_rgba(0,245,255,0.3)]">₹{product.price}</span>
                    </div>

                    <div className="my-8 grid grid-cols-2 gap-4">
                        <div className="glass-card p-4 border-white/5 bg-ocean-800/30">
                            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Location</p>
                            <p className="text-sm font-semibold text-white/90">{product.location}</p>
                        </div>
                        <div className="glass-card p-4 border-white/5 bg-ocean-800/30">
                            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Available Quantity</p>
                            <p className="text-sm font-semibold text-white/90">{product.weight}</p>
                        </div>
                        {product.prep && (
                            <div className="glass-card p-4 border-white/5 bg-ocean-800/30 col-span-2 sm:col-span-1">
                                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Preparation Date</p>
                                <p className="text-sm font-semibold text-white/90">{product.prep}</p>
                            </div>
                        )}
                    </div>

                    <p className="text-white/70 leading-relaxed mb-10 text-sm">
                        This {product.type.toLowerCase()} is sourced directly from local fishermen in {product.location}.
                        Experience the premium quality and absolute freshness that மீனவன் brings from the turbulent depths straight to your table.
                    </p>

                    <div className="flex sm:flex-row flex-col gap-4">
                        <button
                            className="btn-sea-solid flex-1 !py-4 uppercase tracking-widest text-sm"
                            onClick={() => {
                                onAddToCart(product);
                                alert(`${product.type} added to cart!`);
                            }}
                        >
                            ADD TO CART
                        </button>
                        <button
                            className="btn-neon-solid flex-1 !py-4 uppercase tracking-widest text-sm"
                            onClick={handlePayNow}
                        >
                            SECURE PAYMENT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
