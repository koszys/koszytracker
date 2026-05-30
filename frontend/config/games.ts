export interface BannerConfig {
    id: string;
    name: string;
    type: string;
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
        themeColor: '#3b82f6', // blue-500
        themeGradientFrom: '#60a5fa', // blue-400
        themeGradientTo: '#2563eb', // blue-600
        themeGlow: 'rgba(59, 130, 246, 0.5)', // blue-500/50
        homeIcon: '/assets/genshin/genshin-logo.webp',
        trackerIcon: '/assets/genshin/genshin-wish.png',
        importIcon: '/assets/genshin/genshin-mail.webp',
        settingsIcon: '/assets/genshin/settings-icon.webp',
        importScript: "iex (irm 'https://placeholder.com/genshin-import.ps1')"
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
        themeColor: '#eab308', // yellow-500
        themeGradientFrom: '#facc15', // yellow-400
        themeGradientTo: '#ca8a04', // yellow-600
        themeGlow: 'rgba(234, 179, 8, 0.5)', // yellow-500/50
        homeIcon: '/assets/wuwa/wuwa-logo.jpg',
        trackerIcon: '/assets/wuwa/wuwa-convene.webp',
        importIcon: '/assets/wuwa/wuwa-mail.webp',
        settingsIcon: '/assets/wuwa/wuwa-settings.webp',
        importScript: "iex (irm 'https://placeholder.com/wuwa-import.ps1')"
    }
];