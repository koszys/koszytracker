"use client";

import { useSettings } from "@/contexts/SettingsContext";

interface AccountSettingsSectionProps {
    terms: {
        ar: string;
        arFull: string;
        wl: string;
        wlFull: string;
        wlOptions: string[];
        mcTitle: string;
        mcMale: string;
        mcFemale: string;
        maxAr: number;
    };
}

export default function AccountSettingsSection({ terms }: AccountSettingsSectionProps) {
    const { activeAccount, updateActiveAccount } = useSettings();

    return (
        <div className="bg-[#1c1d21] border border-[#52525b] rounded-xl p-4 md:p-6 shadow-lg">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Account Settings</h3>
            <div className="flex flex-wrap items-end gap-4 md:gap-6">

                {/* Account Level */}
                <div className="flex flex-col gap-1.5">
                    <div className="relative group/tooltip w-max">
                        <label className="text-xs text-gray-400 font-bold uppercase border-b border-dashed border-gray-500 cursor-help">
                            {terms.ar}
                        </label>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#27272a] border border-[#52525b] text-white text-[10px] md:text-xs font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            {terms.arFull}
                        </div>
                    </div>
                    <input
                        type="number"
                        min="1"
                        max={terms.maxAr}
                        value={activeAccount?.ar || ''}
                        onChange={(e) => {
                            let val: number | string = parseInt(e.target.value, 10);
                            if (isNaN(val)) val = '';
                            else if (val > terms.maxAr) val = terms.maxAr;
                            else if (val < 1) val = 1;
                            updateActiveAccount('ar', val);
                        }}
                        onBlur={() => {
                            if (!activeAccount?.ar || (typeof activeAccount?.ar === 'number' && activeAccount.ar < 1)) {
                                updateActiveAccount('ar', 1);
                            }
                        }}
                        className="bg-[#18181b] border border-[#52525b] text-white text-sm rounded-lg px-3 py-2 w-20 focus:outline-none focus:border-theme/50 focus:ring-1 focus:ring-theme/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>

                {/* World Level */}
                <div className="flex flex-col gap-1.5">
                    <div className="relative group/tooltip w-max">
                        <label className="text-xs text-gray-400 font-bold uppercase border-b border-dashed border-gray-500 cursor-help">
                            {terms.wl}
                        </label>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#27272a] border border-[#52525b] text-white text-[10px] md:text-xs font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            {terms.wlFull}
                        </div>
                    </div>
                    <select
                        value={activeAccount?.wl || '0'}
                        onChange={(e) => updateActiveAccount('wl', e.target.value)}
                        className="bg-[#18181b] border border-[#52525b] text-white text-sm rounded-lg px-3 py-2 min-w-[5rem] focus:outline-none focus:border-theme/50 focus:ring-1 focus:ring-theme/50 transition-all appearance-none"
                    >
                        {terms.wlOptions.map((opt: string) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Account Server */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold top-1">Server</label>
                    <select
                        value={activeAccount?.server || 'America'}
                        onChange={(e) => updateActiveAccount('server', e.target.value)}
                        className="bg-[#18181b] border border-[#52525b] text-white text-sm rounded-lg px-3 py-2 w-32 focus:outline-none focus:border-theme/50 focus:ring-1 focus:ring-theme/50 transition-all"
                    >
                        <option value="America">America</option>
                        <option value="Europe">Europe</option>
                        <option value="Asia">Asia</option>
                    </select>
                </div>

                {/* Dynamic Main Character Toggle */}
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <label className="text-xs text-gray-400 font-bold">{terms.mcTitle}</label>
                    <div className="flex items-center bg-[#18181b] border border-[#52525b] rounded-lg h-[38px]">
                        <button
                            onClick={() => updateActiveAccount('gender', 'M')}
                            className={`flex-1 h-full px-3 flex items-center justify-center text-xs font-bold transition-colors border border-transparent hover:border-theme cursor-pointer rounded-l-lg relative hover:z-10 ${activeAccount?.gender === 'M' ? 'bg-theme/30 text-white' : 'text-white hover:bg-[#24252a]'}`}
                        >
                            {terms.mcMale}
                        </button>
                        <div className="w-[1px] h-full bg-[#52525b]"></div>
                        <button
                            onClick={() => updateActiveAccount('gender', 'F')}
                            className={`flex-1 h-full px-3 flex items-center justify-center text-xs font-bold transition-colors border border-transparent hover:border-theme cursor-pointer rounded-r-lg relative hover:z-10 ${activeAccount?.gender === 'F' ? 'bg-theme/30 text-white' : 'text-white hover:bg-[#24252a]'}`}
                        >
                            {terms.mcFemale}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}