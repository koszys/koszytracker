"use client";

import { CheckIcon, XIcon } from "@/components/common/Icons";

interface ToastProps {
    toast: { type: 'success' | 'error'; message: string } | null;
    onClose?: () => void;
}

export default function Toast({ toast }: ToastProps) {
    if (!toast) return null;

    return (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm font-bold z-[200] flex items-center gap-2 transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600/90 border border-green-500 text-white' : 'bg-red-600/90 border border-red-500 text-white'}`}>
            {toast.type === 'success' ? (
                <CheckIcon />
            ) : (
                <XIcon />
            )}
            {toast.message}
        </div>
    );
}