"use client";

import { createPortal } from "react-dom";

interface DeleteModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteModal({ isOpen, onConfirm, onCancel }: DeleteModalProps) {
    if (!isOpen) return null;

    const content = (
        <div className="fixed inset-0 bg-[#09090b]/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-white/10 p-6 rounded-xl max-w-sm w-full shadow-2xl">
                <h3 className="text-white font-bold text-lg mb-6">Are you sure you want to delete this account?</h3>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="cursor-pointer px-4 py-2 text-gray-400 hover:text-white hover:border-theme transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="cursor-pointer flex items-center gap-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 hover:border-red-500 px-5 py-2 rounded-lg font-bold transition-colors shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof window === 'undefined') return null;
    return createPortal(content, document.body);
}