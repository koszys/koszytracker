import { useState, useEffect } from "react";
import ChangelogItem from "./ChangelogItem";
import { fetchChangelogs } from "@/data/fetchChangelogs";
import type { ChangelogEntry } from "@/data/fetchChangelogs";

interface ChangelogSectionProps {
    game: string;
}

import { useGame } from "@/contexts/GameContext";

export default function ChangelogSection({ game }: ChangelogSectionProps) {
    const { isDraftMode } = useGame();
    const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showChangelog, setShowChangelog] = useState(false);
    const [visibleCount, setVisibleCount] = useState(4);

    useEffect(() => {
        async function loadChangelogs() {
            const data = await fetchChangelogs(game, isDraftMode);
            setChangelogData(data);
            setLoading(false);
        }
        loadChangelogs();
    }, [game, isDraftMode]);

    if (loading) return null;
    if (!changelogData || changelogData.length === 0) return null;

    return (
        <section className="mt-10 mb-20">
            <button
                onClick={() => {
                    setShowChangelog(!showChangelog);
                    if (!showChangelog) setVisibleCount(4);
                }}
                className="cursor-pointer flex items-center gap-2 text-white hover:text-white hover:border-blue-500 transition-colors text-sm font-bold uppercase tracking-widest bg-[#1c1d21]/70 border border-[#33343a] px-4 py-2 rounded mb-6"
            >
                {showChangelog ? "\u2212 Hide Changelog" : "+ View Changelog"}
            </button>

            {showChangelog && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-[#1c1d21]/70 border border-[#33343a] rounded-lg p-6 space-y-6">
                        {changelogData.slice(0, visibleCount).map((entry, idx) => (
                            <div key={idx} className={idx !== 0 ? "border-t border-[#33343a] pt-6" : ""}>
                                <ChangelogItem
                                    version={entry.version}
                                    date={entry.date}
                                    changes={entry.changes}
                                />
                            </div>
                        ))}

                        <div className="flex flex-wrap gap-4 pt-2">
                            {visibleCount < changelogData.length && (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 4)}
                                    className="cursor-pointer flex items-center gap-2 text-white hover:text-white hover:border-blue-500 transition-colors text-sm font-bold uppercase tracking-widest bg-[#1c1d21]/60 border border-[#33343a] px-4 py-2 rounded"
                                >
                                    {"\u2193"} Show more
                                </button>
                            )}

                            {visibleCount > 4 && (
                                <button
                                    onClick={() => setVisibleCount(prev => Math.max(4, prev - 4))}
                                    className="cursor-pointer flex items-center gap-2 text-white hover:text-white hover:border-blue-500 transition-colors text-sm font-bold uppercase tracking-widest bg-[#1c1d21]/60 border border-[#33343a] px-4 py-2 rounded"
                                >
                                    {"\u2191"} Show less
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setShowChangelog(false);
                                    setVisibleCount(4);
                                }}
                                className="cursor-pointer flex items-center gap-2 text-white hover:text-white hover:border-blue-500 transition-colors text-sm font-bold uppercase tracking-widest bg-[#1c1d21]/60 border border-[#33343a] px-4 py-2 rounded"
                            >
                                {"\u00d7"} Hide Changelog
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
