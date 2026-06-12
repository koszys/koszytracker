export interface BannerConfig {
    id: string;
    name: string;
    type: string;
    cardImage?: string;
}

export interface RarityTier {
    value: number;
    label: string;
    color: string;
}

export interface GameConfig {
    id: string;
    name: string;
    path: string;
    bgUrl: string;
    status: 'active' | 'comingsoon';
    wishName: string;
    trackerName: string;
    importName: string;
    bgColor?: string;
    currencyName: string;
    pullName: string;
    banners: BannerConfig[];
    rarityTiers: RarityTier[];
    // Dynamic Theme Variables
    themeColor: string;
    themeGradientFrom: string;
    themeGradientTo: string;
    themeGlow: string;
    // Sidebar Icons
    homeIcon: string;
    trackerIcon: string;
    importIcon: string;
    settingsIcon: string;
    importScript: string;
    redeemUrl?: string;
    features: ("tracker" | "import")[];
}

export const GAME_CONFIG: GameConfig[] = [
    {
        id: 'genshin',
        name: 'Genshin Impact',
        path: '/dashboard/tracker',
        bgUrl: '/assets/gamebackground/genshinv1-1.jpg',
        status: 'active',
        wishName: 'Wishes',
        trackerName: 'Wish Tracker',
        importName: 'Import Wishes',
        currencyName: 'Primogems',
        pullName: 'Wishes',
        banners: [
            { id: 'character', name: 'Character Event', type: 'character' },
            { id: 'weapon', name: 'Weapon Event', type: 'weapon' },
            { id: 'standard', name: 'Standard', type: 'standard' },
            { id: 'chronicled', name: 'Chronicled Wish', type: 'chronicled' }
        ],
        rarityTiers: [
            { value: 5, label: '5\u2726', color: 'text-yellow-400' },
            { value: 4, label: '4\u2726', color: 'text-purple-400' },
            { value: 3, label: '3\u2726', color: 'text-gray-300' },
        ],
        themeColor: '#3b82f6', // blue-500
        themeGradientFrom: '#60a5fa', // blue-400
        themeGradientTo: '#2563eb', // blue-600
        themeGlow: 'rgba(59, 130, 246, 0.5)', // blue-500/50
        homeIcon: '/assets/genshin/genshin-logo.webp',
        trackerIcon: '/assets/genshin/genshin-wish.png',
        importIcon: '/assets/genshin/genshin-mail.webp',
        settingsIcon: '/assets/genshin/settings-icon.webp',
        importScript: "iex (irm 'https://placeholder.com/genshin-import.ps1')",
        redeemUrl: 'https://genshin.hoyoverse.com/en/gift',
        features: ['tracker', 'import']
    },
    {
        id: 'wuwa',
        name: 'Wuthering Waves',
        path: '/dashboard/tracker',
        bgUrl: '/assets/gamebackground/wuwa_background.jpg',
        status: 'active',
        wishName: 'Convenes',
        trackerName: 'Convene Tracker',
        importName: 'Import Convenes',
        currencyName: 'Astrites',
        pullName: 'Convenes',
        banners: [
            { id: 'character', name: 'Featured Resonator', type: 'character' },
            { id: 'weapon', name: 'Featured Weapon', type: 'weapon' },
            { id: 'characterpermanent', name: 'Permanent Resonator', type: 'characterpermanent' },
            { id: 'weaponpermanent', name: 'Permanent Weapon', type: 'weaponpermanent' }
        ],
        rarityTiers: [
            { value: 5, label: '5\u2726', color: 'text-yellow-400' },
            { value: 4, label: '4\u2726', color: 'text-purple-400' },
            { value: 3, label: '3\u2726', color: 'text-gray-300' },
        ],
        themeColor: '#eab308', // yellow-500
        themeGradientFrom: '#facc15', // yellow-400
        themeGradientTo: '#ca8a04', // yellow-600
        themeGlow: 'rgba(234, 179, 8, 0.5)', // yellow-500/50
        homeIcon: '/assets/wuwa/wuwa-logo.jpg',
        trackerIcon: '/assets/wuwa/wuwa-convene.webp',
        importIcon: '/assets/wuwa/wuwa-mail.webp',
        settingsIcon: '/assets/wuwa/wuwa-settings.webp',
        importScript: "iex (irm 'https://placeholder.com/wuwa-import.ps1')",
        features: ['tracker', 'import']
    },
    {
        id: 'hsr',
        name: 'Honkai: Star Rail',
        path: '/dashboard',
        bgUrl: '/assets/gamebackground/hsr_background.png',
        status: 'comingsoon',
        wishName: 'Warps',
        trackerName: 'Warp Tracker',
        importName: 'Import Warps',
        currencyName: 'Stellar Jade',
        pullName: 'Warps',
        banners: [],
        rarityTiers: [
            { value: 5, label: '5\u2726', color: 'text-yellow-400' },
            { value: 4, label: '4\u2726', color: 'text-purple-400' },
            { value: 3, label: '3\u2726', color: 'text-gray-300' },
        ],
        themeColor: '#ec4899',
        themeGradientFrom: '#f472b6',
        themeGradientTo: '#db2777',
        themeGlow: 'rgba(236, 72, 153, 0.5)',
        homeIcon: '/assets/hsr/hsr-logo.png',
        trackerIcon: '/assets/hsr/hsr-warp.webp',
        importIcon: '/assets/hsr/hsr-import.webp',
        settingsIcon: '/assets/genshin/settings-icon.webp',
        importScript: '',
        features: []
    },
    {
        id: 'zzz',
        name: 'Zenless Zone Zero',
        path: '/dashboard',
        bgUrl: '/assets/gamebackground/zzz_background.jpg',
        status: 'comingsoon',
        wishName: 'Signals',
        trackerName: 'Signal Tracker',
        importName: 'Import Signals',
        currencyName: 'Polychromes',
        pullName: 'Signals',
        banners: [],
        rarityTiers: [
            { value: 5, label: '5\u2726', color: 'text-yellow-400' },
            { value: 4, label: '4\u2726', color: 'text-purple-400' },
            { value: 3, label: '3\u2726', color: 'text-gray-300' },
        ],
        themeColor: '#ef4444',
        themeGradientFrom: '#f87171',
        themeGradientTo: '#dc2626',
        themeGlow: 'rgba(239, 68, 68, 0.5)',
        homeIcon: '/assets/zzz/zzz-logo.png',
        trackerIcon: '/assets/zzz/zzz-signals.webp',
        importIcon: '/assets/zzz/zzz-import.webp',
        settingsIcon: '/assets/zzz/zzz-settings.webp',
        importScript: '',
        features: []
    }
];