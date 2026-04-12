import React from 'react';

const GovernmentSchemes: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const schemes = [
        {
            id: 'kcc',
            title: 'Kisan Credit Card (KCC) for Fishermen',
            category: 'Credit & Finance',
            description: 'Extended to fishers, this provides short-term credit and working capital for fishery operations.',
            bestFor: 'Working capital for daily needs, purchasing feed, and operating expenses.',
            benefits: 'Interest subvention and credit up to ₹2 Lakhs.',
            link: 'https://www.jansamarth.in'
        },
        {
            id: 'fidf',
            title: 'Fisheries and Aquaculture Infrastructure Development Fund (FIDF)',
            category: 'Infrastructure',
            description: 'Provides concessional finance for infrastructure projects like fishing harbors, fish landing centers, and cold chains.',
            bestFor: 'Cooperative societies, federations, and entrepreneurs setting up large-scale fisheries projects.',
            benefits: 'Interest subvention up to 3%, loan up to 80% of project cost.',
            link: 'https://dof.gov.in/'
        },
        {
            id: 'group-insurance',
            title: 'Group Accident Insurance for Active Fishermen',
            category: 'Social Security',
            description: 'Provides insurance coverage for accidental death or permanent disability (up to ₹5 lakh) and hospitalization (up to ₹25,000).',
            bestFor: 'Security of active fishermen while on duty.',
            benefits: '₹5 Lakh for death/permanent total disability, ₹2.5 Lakh for partial disability.',
            link: 'https://www.fisheries.tn.gov.in/WelfareSchemes.html'
        },
        {
            id: 'saving-cum-relief',
            title: 'National Saving-cum-Relief Scheme (NFSRS)',
            category: 'Social Security',
            description: 'Provides financial assistance during the fishing ban or lean period to marine fishermen, often 50:50 share between Centre and State.',
            bestFor: 'Livelihood support during non-fishing months.',
            benefits: 'Accumulated relief distribution during lean months.',
            link: 'https://www.fisheries.tn.gov.in/WelfareSchemes.html'
        },
        {
            id: 'vcs',
            title: 'Vessel Communication and Support System (Under PMMSY)',
            category: 'Safety & Technology',
            description: 'Installation of transponders on 1,00,000 fishing vessels to provide safe communication, free of cost to the boat owners.',
            bestFor: 'Sea safety and emergency communication in coastal areas.',
            benefits: 'Real-time weather alerts and emergency distress messaging.',
            link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2099606'
        },
        {
            id: 'nfdb',
            title: 'National Fisheries Development Board (NFDB) Schemes',
            category: 'Financial Assistance',
            description: 'The NFDB provides training and financial support for modern aquaculture, such as Cage Culture and Biofloc technology.',
            bestFor: 'Technology adoption, training, and capacity building.',
            benefits: 'Subsidies ranging from 20% to 40% (up to 60% for SC/ST/Women).',
            link: 'https://nfdb.gov.in/'
        },
        {
            id: 'pmmkssy',
            title: 'Pradhan Mantri Matsya Kisan Samridhi Sah-Yojana (PMMKSSY)',
            category: 'Business & Growth',
            description: 'A new sub-scheme under PMMSY aimed at supporting fish farmers with financial aid and technology to improve income.',
            bestFor: 'Enhancing micro and small enterprise capabilities in fisheries.',
            benefits: 'Performance grants, insurance incentives, and institutional credit access.',
            link: 'https://ciba.res.in/?page_id=16672'
        },
        {
            id: 'housing',
            title: 'Housing for Fishermen (Central Scheme)',
            category: 'Welfare',
            description: 'Provides financial assistance for constructing houses (e.g., ₹1,20,000 per house) for fishermen.',
            bestFor: 'Improving living standards and providing safe, permanent housing.',
            benefits: 'Grant for house construction and basic amenities.',
            link: 'https://www.fisheries.tn.gov.in/WelfareSchemes.html'
        },
        {
            id: 'nfdp',
            title: 'National Fisheries Development Platform (NFDP)',
            category: 'Digital Services',
            description: 'A digital portal to integrate fishers, allowing them to access, apply, and monitor schemes.',
            bestFor: 'Easy access to government benefits and digital registration.',
            benefits: 'Seamless access to credit, insurance, and direct benefit transfer.',
            link: 'https://nfdb.gov.in/'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fade-in text-white">
            <header className="flex items-center gap-4 mb-8">
                <button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-lg shadow-black/20"
                    onClick={onBack}
                >
                    <span className="text-xl">←</span>
                    <span className="font-semibold uppercase tracking-wider text-xs">Back</span>
                </button>
                <h1 className="text-3xl font-black tracking-tight drop-shadow-md">Government Schemes</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemes.map((scheme) => (
                    <div
                        key={scheme.id}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg flex flex-col h-full group transition-all duration-300 hover:bg-white/15 hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight group-hover:text-cyan-400 transition-colors leading-tight">
                                    {scheme.title}
                                </h3>
                                <span className="inline-block bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {scheme.category}
                                </span>
                            </div>
                        </div>

                        <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow italic">
                            {scheme.description}
                        </p>

                        <div className="bg-black/20 rounded-xl p-5 mb-6 space-y-4 border border-white/5">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Best For</h4>
                                <p className="text-sm font-bold text-cyan-400 leading-tight">{scheme.bestFor}</p>
                            </div>

                            {scheme.benefits && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Key Benefits</h4>
                                    <p className="text-sm text-white/90 leading-tight">{scheme.benefits}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                            <a
                                href={scheme.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1 text-sm underline-offset-4 hover:underline"
                            >
                                Official Link ↗
                            </a>
                            <button
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-cyan-500/30 active:scale-95"
                                onClick={() => window.open(scheme.link, '_blank')}
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Newsletter Section */}
            <div className="bg-gradient-to-br from-ocean-900 via-ocean-950 to-black border border-white/10 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

                <h2 className="text-3xl font-black mb-4 drop-shadow-md">Stay Updated on New Schemes</h2>
                <p className="text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Subscribe to receive automatic notifications about new government subsidies, deadline reminders, and seasonal welfare benefits tailored for your region.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email or phone"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-all placeholder:text-white/20 text-sm"
                    />
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-cyan-500/30 active:scale-95 whitespace-nowrap">
                        Subscribe Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GovernmentSchemes;
