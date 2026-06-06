"use client";

import { useState, useEffect } from "react";
import { RarityTier } from "@/config/games";
import { WishData } from "@/hooks/useWishes";
import { formatWishTime } from "@/utils/formatters";
import PaginationFooter from "@/components/common/PaginationFooter";

interface PullHistoryTableProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeRarities: Set<number>;
    onToggleRarity: (rarity: number) => void;
    rarityTiers: RarityTier[];
    rarityCounts: Record<number, number>;
    paginated: (WishData & { pity: number })[];
    pullNumberMap: Map<string, number>;
    currentPage: number;
    onPageChange: (page: number) => void;
    rowsPerPage: number;
    onRowsPerPageChange: (perPage: number) => void;
    filteredLength: number;
    lowestRarity: number;
}

const COLUMNS = [
    { id: "pullNo", label: "Pull No." },
    { id: "itemName", label: "Item Name" },
    { id: "rarity", label: "Rarity" },
    { id: "pity", label: "Pity" },
    { id: "dateReceived", label: "Date Received" },
];

export default function PullHistoryTable({
    searchQuery, onSearchChange,
    activeRarities, onToggleRarity,
    rarityTiers, rarityCounts,
    paginated, pullNumberMap,
    currentPage, onPageChange,
    rowsPerPage, onRowsPerPageChange,
    filteredLength, lowestRarity,
}: PullHistoryTableProps) {
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        new Set(["pullNo", "itemName", "rarity", "pity", "dateReceived"])
    );
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest('.popover-container')) {
                setIsColumnsOpen(false);
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleColumn = (col: string) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(col)) {
                if (next.size > 1) {
                    next.delete(col);
                }
            } else {
                next.add(col);
            }
            return next;
        });
    };

    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-lg p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Pull History</h2>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4 relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => { onSearchChange(e.target.value); onPageChange(1); }}
                    placeholder="Search across columns..."
                    className="w-full sm:max-w-[280px] bg-[#27272a] border border-[#52525b] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gray-500"
                />

                <div className="flex gap-2 items-center justify-end">
                    <div className="relative popover-container">
                        <button
                            onClick={() => {
                                setIsColumnsOpen(!isColumnsOpen);
                                setIsFilterOpen(false);
                            }}
                            className={`cursor-pointer p-2 rounded border transition-colors flex items-center justify-center ${isColumnsOpen
                                ? "bg-[#2a2b30] border-gray-400 text-white"
                                : "bg-[#1c1d21] border-[#52525b] text-gray-300 hover:border-gray-500"
                                }`}
                            title="Toggle Columns"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="9" y1="3" x2="9" y2="21" />
                                <line x1="15" y1="3" x2="15" y2="21" />
                            </svg>
                        </button>

                        {isColumnsOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#1c1d21] border border-[#52525b] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-2">
                                <p className="text-xs text-gray-400 font-semibold mb-1">Columns</p>
                                {COLUMNS.map(col => {
                                    const checked = visibleColumns.has(col.id);
                                    return (
                                        <label key={col.id} className="flex items-center gap-3 cursor-pointer text-sm text-gray-200 hover:text-white transition-colors py-1">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleColumn(col.id)}
                                                className="cursor-pointer rounded border-[#52525b] bg-[#27272a] text-theme focus:ring-0 focus:ring-offset-0 w-4 h-4"
                                            />
                                            <span>{col.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative popover-container">
                        <button
                            onClick={() => {
                                setIsFilterOpen(!isFilterOpen);
                                setIsColumnsOpen(false);
                            }}
                            className={`cursor-pointer p-2 rounded border transition-colors flex items-center justify-center gap-1.5 ${isFilterOpen
                                ? "bg-[#2a2b30] border-gray-400 text-white"
                                : "bg-[#1c1d21] border-[#52525b] text-gray-300 hover:border-gray-500"
                                }`}
                            title="Filter Rarities"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                            {activeRarities.size < rarityTiers.length && (
                                <span className="bg-theme text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[16px] text-center">
                                    {activeRarities.size}
                                </span>
                            )}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#1c1d21] border border-[#52525b] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-2">
                                <p className="text-xs text-gray-400 font-semibold mb-1">Filters</p>
                                {rarityTiers.map(tier => {
                                    const checked = activeRarities.has(tier.value);
                                    const count = rarityCounts[tier.value] || 0;
                                    return (
                                        <label key={tier.value} className="flex items-center justify-between cursor-pointer text-sm text-gray-200 hover:text-white transition-colors py-1">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => onToggleRarity(tier.value)}
                                                    className="cursor-pointer rounded border-[#52525b] bg-[#27272a] text-theme focus:ring-0 focus:ring-offset-0 w-4 h-4"
                                                />
                                                <span className={`font-semibold flex items-center gap-1 ${tier.color}`}>
                                                    {"✦".repeat(tier.value)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">
                                                {count}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                    <thead>
                        <tr className="text-gray-300 text-xs uppercase border-b border-[#52525b]">
                            {visibleColumns.has("pullNo") && <th className="pb-3 pr-4 font-medium">Pull No.</th>}
                            {visibleColumns.has("itemName") && <th className="pb-3 pr-4 font-medium">Item Name</th>}
                            {visibleColumns.has("rarity") && <th className="pb-3 pr-4 font-medium">Rarity</th>}
                            {visibleColumns.has("pity") && <th className="pb-3 pr-4 font-medium">Pity</th>}
                            {visibleColumns.has("dateReceived") && <th className="pb-3 font-medium">Date Received</th>}
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-200">
                        {paginated.map((wish) => {
                            const pullNo = pullNumberMap.get(wish.id) ?? '—';
                            const tier = rarityTiers.find(t => t.value === wish.rarity);
                            return (
                                <tr key={wish.id} className="border-b border-[#52525b]/50 hover:bg-[#2a2b30]/30 transition-colors">
                                    {visibleColumns.has("pullNo") && <td className="py-3 pr-4">{pullNo}</td>}
                                    {visibleColumns.has("itemName") && (
                                        <td className={`py-3 pr-4 font-medium whitespace-nowrap ${tier?.color ?? 'text-gray-200'}`}>
                                            {wish.name}
                                        </td>
                                    )}
                                    {visibleColumns.has("rarity") && (
                                        <td className={`py-3 pr-4 font-semibold whitespace-nowrap ${tier?.color ?? 'text-gray-200'}`}>
                                            {tier?.label ?? `${wish.rarity}✦`}
                                        </td>
                                    )}
                                    {visibleColumns.has("pity") && <td className="py-3 pr-4">{wish.rarity === lowestRarity ? 'N/A' : wish.pity}</td>}
                                    {visibleColumns.has("dateReceived") && <td className="py-3 text-gray-400 whitespace-nowrap">{formatWishTime(wish.time)}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <PaginationFooter
                page={currentPage}
                onPageChange={onPageChange}
                totalItems={filteredLength}
                perPage={rowsPerPage}
                onPerPageChange={onRowsPerPageChange}
                perPageOptions={[5, 10, 20, 50]}
                itemLabel="Rows per page"
            />
        </div>
    );
}
