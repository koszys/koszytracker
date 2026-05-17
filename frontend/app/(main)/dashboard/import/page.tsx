"use client";

import { useState } from "react";
import { useGame } from "@/contexts/GameContext";

interface WishData {
    id: string;
    name: string;
    rarity: number;
    gacha_type: number;
    time: string;
}

export default function ImportPage() {
    const { activeGame: game } = useGame();
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ message: string; wishes?: WishData[] } | null>(null);
    const [error, setError] = useState("");

    const handleImport = async () => {
        if (!url.trim()) {
            setError("Please paste your wish history URL");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("http://localhost:8000/api/wishes/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to import wishes");
            }

            setResult(data);

            if (data.wishes && data.wishes.length > 0) {
                const existingWishes = localStorage.getItem(`wishes-${game.id}`);
                const existing = existingWishes ? JSON.parse(existingWishes) : [];
                const newWishes = [...data.wishes, ...existing];
                localStorage.setItem(`wishes-${game.id}`, JSON.stringify(newWishes));
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(game.importScript || "iex (irm 'https://placeholder.com/script.ps1')");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{game.importName}</h1>
                <p className="text-gray-300">Import and save your {game.name} {game.wishName.toLowerCase()} history.</p>
            </div>

            <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-6 md:p-8 mb-8 shadow-lg">
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[#3f3f46]">
                    <button className="px-4 py-2 bg-[#27272a] hover:bg-[#33343a] text-white border border-[#52525b] rounded-lg text-sm font-bold transition-colors">
                        Windows (PowerShell)
                    </button>
                </div>
                
                <div className="flex flex-col gap-8">
                    
                    {/* Step 1 */}
                    <div className="flex gap-4 md:gap-6">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#27272a] border border-[#52525b] flex items-center justify-center text-white font-bold text-lg">1</div>
                        <div className="flex-1 min-w-0 pt-1 md:pt-2">
                            <p className="text-gray-300 text-sm md:text-base">Start <strong className="text-white">{game.name}</strong> on your PC and open your records history.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4 md:gap-6">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#27272a] border border-[#52525b] flex items-center justify-center text-white font-bold text-lg">2</div>
                        <div className="flex-1 min-w-0 pt-1 md:pt-2">
                            <p className="text-gray-300 text-sm md:text-base">Open Windows PowerShell. You can do this by searching for <strong>'PowerShell'</strong> in the Windows search bar.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4 md:gap-6">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#27272a] border border-[#52525b] flex items-center justify-center text-white font-bold text-lg">3</div>
                        <div className="flex-1 min-w-0 pt-1 md:pt-2">
                            <p className="text-gray-300 text-sm md:text-base mb-3">Copy and paste the following command into PowerShell and press Enter:</p>
                            
                            <div className="relative group">
                                <pre className="bg-[#09090b] border border-[#3f3f46] p-4 rounded-lg overflow-x-auto text-sm text-gray-300 font-mono pr-16">
                                    {game.importScript || "iex (irm 'https://placeholder.com/script.ps1')"}
                                </pre>
                                <button
                                    onClick={handleCopy}
                                    className="cursor-pointer absolute top-2 right-2 p-2 bg-[#27272a] hover:bg-[#3f3f46] border border-[#52525b] rounded-md text-gray-300 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <svg className="w-4 h-4 text-theme" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4 md:gap-6">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#27272a] border border-[#52525b] flex items-center justify-center text-white font-bold text-lg">4</div>
                        <div className="flex-1 min-w-0 pt-1 md:pt-2">
                            <p className="text-gray-300 text-sm md:text-base mb-3">Paste the output of the command into the input below:</p>
                            
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Paste your wish history URL here..."
                                    className="w-full max-w-xl h-11 px-4 bg-[#09090b] border border-[#52525b] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-theme font-mono text-sm transition-colors"
                                />
                                
                                {error && (
                                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p>{error}</p>
                                    </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-xs text-gray-500">
                                        <strong>Note:</strong> The URL expires after a short time. If import fails, run the script again.
                                    </p>
                                    
                                    <button
                                        onClick={handleImport}
                                        disabled={loading || !url.trim()}
                                        className="cursor-pointer px-6 py-2.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white disabled:opacity-50 disabled:hover:border-[#52525b] disabled:hover:text-gray-300 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                                    >
                                        {loading ? "Importing..." : `Import ${game.wishName}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Result */}
            {result && (
                <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Import Result</h2>
                    <p className="text-gray-400 mb-4">{result.message}</p>
                    {result.wishes && result.wishes.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-gray-500 text-sm">Preview (first 5 wishes):</p>
                            {result.wishes.map((wish, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-md border ${
                                        wish.rarity === 5
                                            ? "border-yellow-600 bg-yellow-900/20"
                                            : wish.rarity === 4
                                            ? "border-purple-600 bg-purple-900/20"
                                            : "border-blue-600 bg-blue-900/20"
                                    }`}
                                >
                                    <span className="text-white font-medium">{wish.name}</span>
                                    <span className={`text-sm font-bold ${
                                        wish.rarity === 5
                                            ? "text-yellow-400"
                                            : wish.rarity === 4
                                            ? "text-purple-400"
                                            : "text-blue-400"
                                    }`}>
                                        {wish.rarity}★
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}