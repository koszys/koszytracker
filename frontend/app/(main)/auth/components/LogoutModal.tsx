"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface LogoutModalProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onCancel, onConfirm }: LogoutModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-[#09090b]/80 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={onCancel}></div>
            <div className="relative bg-[#1c1d21] border border-[#52525b] p-6 rounded-xl max-w-sm w-full shadow-2xl">
                <h3 className="text-white font-bold text-lg mb-6 text-center">Are you sure you want to sign out?</h3>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={onCancel} 
                        className="px-5 py-2 text-gray-400 hover:text-white hover:border-theme transition-colors font-medium cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 hover:border-red-500 px-6 py-2 rounded-lg font-bold transition-colors shadow-md cursor-pointer"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
