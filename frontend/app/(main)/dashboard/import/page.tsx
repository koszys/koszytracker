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

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">{game.importName}</h1>
                <p className="text-gray-300 text-sm mt-1">Import your {game.name} wish history</p>
            </div>

            {/* Instructions */}
            <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6 mb-8">
                <h2 className="text-lg font-bold text-white mb-4">How to Import</h2>
                <ol className="list-decimal list-inside text-gray-400 space-y-3">
                    <li>Open Genshin Impact and go to Wish History</li>
                    <li>Run the PowerShell script from stuff/script.txt</li>
                    <li>Paste the generated URL below</li>
                    <li>Click &quot;Import Wishes&quot; to fetch your history</li>
                </ol>
                <div className="mt-4 p-4 bg-[#27272a] rounded-md">
                    <p className="text-gray-500 text-xs">
                        <strong>Note:</strong> The URL expires after a short time. If import fails, run the script again.
                    </p>
                </div>
            </div>

            {/* Import Form */}
            <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-6 mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Wish History URL</h2>
                <div className="space-y-4">
                    <textarea
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste your wish history URL here (starts with https://hk4e-api-os.hoyoverse.com...)"
                        className="w-full h-32 px-4 py-3 bg-[#27272a] border border-[#52525b] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
                    />
                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                    <button
                        onClick={handleImport}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md transition-colors font-bold"
                    >
                        {loading ? "Importing..." : "Import Wishes"}
                    </button>
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