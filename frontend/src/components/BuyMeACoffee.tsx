import React, { useState } from 'react';
import { Coffee, X, Heart } from 'lucide-react';

const BuyMeACoffee: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // 1. Place your QR code image in the "frontend/public" folder
    // 2. Name it "gpay-qr.jpg" (or change the filename below to match yours)
    const qrCodeImage = "/kishanqr.png";

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-amber-500/20 transition-all duration-300 animate-bounce-subtle"
                aria-label="Buy me a coffee"
            >
                <Coffee className="w-5 h-5 fill-black/20" />
                <span>Buy me a coffee</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Modal Content */}
                    <div
                        className="relative w-full max-w-sm bg-[#111] border border-amber-500/20 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                                <Coffee className="w-8 h-8 text-amber-500" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">Support My Work</h3>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                If you enjoy using CodeHive, consider buying me a coffee! Your support helps keep the servers running. 🚀
                            </p>

                            {/* QR Code Container */}
                            <div className="bg-white p-4 rounded-xl shadow-inner mb-6 relative group">
                                <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-xl pointer-events-none group-hover:border-amber-500 transition-colors"></div>
                                {/* Use a real image tag here */}
                                <img
                                    src={qrCodeImage}
                                    alt="GPay QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                                    Scan with GPay
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-amber-500 font-medium text-sm">
                                <Heart className="w-4 h-4 fill-current animate-pulse" />
                                <span>Thank you for your support!</span>
                            </div>
                        </div>
                    </div>

                    {/* Click outside to close */}
                    <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
                </div>
            )}
        </>
    );
};

export default BuyMeACoffee;
