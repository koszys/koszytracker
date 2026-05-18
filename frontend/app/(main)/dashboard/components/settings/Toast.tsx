"use client";

interface ToastProps {
    toast: { type: 'success' | 'error'; message: string } | null;
    onClose?: () => void;
}

export default function Toast({ toast }: ToastProps) {
    if (!toast) return null;

    return (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm font-bold z-[200] flex items-center gap-2 transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600/90 border border-green-500 text-white' : 'bg-red-600/90 border border-red-500 text-white'}`}>
            {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {toast.message}
        </div>
    );
}