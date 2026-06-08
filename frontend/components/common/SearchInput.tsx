"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchInput({ value, onChange, placeholder = "Search games...", className }: SearchInputProps) {
    const [isOpen, setIsOpen] = useState(value.length > 0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const close = useCallback(() => {
        setIsOpen(false);
        onChange("");
    }, [onChange]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => {
                    if (prev) {
                        onChange("");
                    }
                    return !prev;
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onChange]);

    if (!isOpen) {
        return (
            <div className={`mb-6 ${className ?? ""}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-1.5 text-sm text-gray-200 hover:text-white transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                    <kbd className="hidden sm:inline ml-1 px-1.5 py-0.5 text-xs bg-[#33343a] rounded text-gray-200">Ctrl+K</kbd>
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <div className={`relative z-40 mb-6 max-w-md ${className ?? ""}`}>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-10 pr-14 bg-[#1c1d21] border border-[#33343a] rounded-md text-white placeholder-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                />
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <kbd className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs bg-[#33343a] rounded text-gray-200">Ctrl+K</kbd>
            </div>
        </>
    );
}
