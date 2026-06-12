"use client";

interface PaginationFooterProps {
    page: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
    perPageOptions: number[];
    itemLabel: string;
}

export default function PaginationFooter({
    page,
    onPageChange,
    totalItems,
    perPage,
    onPerPageChange,
    perPageOptions,
    itemLabel,
}: PaginationFooterProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const safePage = Math.min(page, totalPages);

    function goTo(p: number) {
        onPageChange(Math.max(1, Math.min(p, totalPages)));
    }

    const fromItem = totalItems > 0 ? (safePage - 1) * perPage + 1 : 0;
    const toItem = Math.min(safePage * perPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-center gap-4 mt-6 text-sm text-gray-300 w-full">
            <div className="flex items-center gap-2 whitespace-nowrap order-3 sm:order-1">
                <span>{itemLabel}:</span>
                <select
                    value={perPage}
                    onChange={e => { onPerPageChange(Number(e.target.value)); onPageChange(1); }}
                    className="cursor-pointer bg-[#27272a] border border-[#52525b] rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-gray-500"
                >
                    {perPageOptions.map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>

            <div className="text-white whitespace-nowrap font-medium order-1 sm:order-2">
                {totalItems > 0 ? `${fromItem}-${toItem} of ${totalItems}` : "0 of 0"}
            </div>

            <div className="flex items-center gap-2 order-2 sm:order-3">
                <button
                    onClick={() => goTo(1)}
                    disabled={safePage === 1}
                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors font-mono"
                >|&lt;</button>
                <button
                    onClick={() => goTo(safePage - 1)}
                    disabled={safePage === 1}
                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors font-mono"
                >&lt;</button>
                <button
                    onClick={() => goTo(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors font-mono"
                >&gt;</button>
                <button
                    onClick={() => goTo(totalPages)}
                    disabled={safePage === totalPages}
                    className="cursor-pointer px-2 py-1 rounded hover:bg-[#2a2b30] disabled:text-gray-500 disabled:hover:bg-transparent transition-colors font-mono"
                >&gt;|</button>
            </div>
        </div>
    );
}
