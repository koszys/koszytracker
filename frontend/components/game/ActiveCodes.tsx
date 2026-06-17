import { useEffect, useState } from "react";
import { fetchCodes } from "@/data/fetchCodes";
import type { GameCode } from "@/data/types";
import { Copy, Check } from "lucide-react";

import { useGame } from "@/contexts/GameContext";

interface ActiveCodesProps {
    game: string;
    redeemUrl?: string;
}

export default function ActiveCodes({ game, redeemUrl }: ActiveCodesProps) {
    const { isDraftMode } = useGame();
    const [codes, setCodes] = useState<GameCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const hasRedeemLink = typeof redeemUrl === "string" && redeemUrl.trim().length > 0;

    useEffect(() => {
        if (game) {
            async function loadCodes() {
                setLoading(true);
                const data = await fetchCodes(game, isDraftMode);
                setCodes(data);
                setLoading(false);
            }
            loadCodes();
        }
    }, [game, isDraftMode]);

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 1200);
        } catch (error) {
            console.error("Failed to copy code:", error);
        }
    };

    if (loading) return <div className="text-gray-400 p-4">Loading codes...</div>;
    if (!codes || codes.length === 0) return null;

    const sortedCodes = [...codes].sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
    });

    return (
        <div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {sortedCodes.map((item, idx) => {
                    const redeemLink = hasRedeemLink
                        ? redeemUrl.includes("hoyoverse.com")
                            ? `${redeemUrl}?code=${item.code}`
                            : redeemUrl
                        : undefined;

                    return (
                        <div
                            key={item.id || idx}
                            className="relative bg-[#1c1d21]/80 border border-[#33343a] hover:border-[#4b4c53] rounded-lg p-4 sm:p-6 transition-colors group overflow-hidden"
                        >
                            {item.isNew && (
                                <div className="absolute top-0 right-0 bg-emerald-900/40 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider shadow-md">
                                    New
                                </div>
                            )}

                            <div className="mb-1 sm:mb-2">
                                {hasRedeemLink ? (
                                    <a
                                        href={redeemLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block min-w-0 truncate font-mono text-base sm:text-xl font-bold text-white hover:text-theme transition-colors tracking-wide underline underline-offset-4 decoration-theme/50 hover:decoration-theme"
                                        title={item.code}
                                    >
                                        {item.code}
                                    </a>
                                ) : (
                                    <span
                                        className="block min-w-0 truncate font-mono text-base sm:text-xl font-bold text-white tracking-wide"
                                        title={item.code}
                                    >
                                        {item.code}
                                    </span>
                                )}
                            </div>

                            <p
                                className="text-gray-300 text-xs sm:text-sm pr-10 line-clamp-2 sm:line-clamp-3"
                                title={item.reward}
                            >
                                {item.reward}
                            </p>

                            <button
                                type="button"
                                onClick={() => copyCode(item.code)}
                                title="Copy code"
                                className="cursor-pointer absolute bottom-0 right-0 inline-flex items-center justify-center bg-white/10 p-2 sm:p-2.5 text-gray-300 transition-colors hover:bg-white/20 hover:border-theme hover:text-white rounded-tl-lg"
                            >
                                {copiedCode === item.code ? (
                                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" strokeWidth={3} />
                                ) : (
                                    <Copy className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
