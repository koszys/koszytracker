export interface BannerConfig {
    id: string;
    name: string;
    type: 'character' | 'weapon' | 'standard' | 'chronicled' | 'beginner';
}

export interface GameConfig {
    id: string;
    name: string;
    path: string;
    bgUrl: string;
    logoUrl: string;
    iconUrl: string;
    status: 'active' | 'comingsoon';
    wishName: string;
    importName: string;
    bgColor?: string;
    currencyName: string;
    pullName: string;
    banners: BannerConfig[];
}

export const GAME_CONFIG: GameConfig[] = [
    {
        id: 'genshin',
        name: 'Genshin Impact',
        path: '/tracker',
        bgUrl: '/assets/gamebackground/genshinv1-1.jpg',
        logoUrl: '/assets/genshin/genshin-logo.webp',
        iconUrl: '/assets/genshin/genshin-logo.webp',
        status: 'active',
        wishName: 'Wish Tracker',
        importName: 'Import Wishes',
        currencyName: 'Primogems',
        pullName: 'Wishes',
        banners: [
            { id: 'character', name: 'Character Event Wish', type: 'character' },
            { id: 'weapon', name: 'Weapon Event Wish', type: 'weapon' },
            { id: 'standard', name: 'Standard Wish', type: 'standard' },
            { id: 'chronicled', name: 'Chronicled Wish', type: 'chronicled' }
        ]
    },
    // Add these fields to HSR, ZZZ, WuWa as needed. Example for WuWa:
    // currencyName: 'Astrites', pullName: 'Convenes', banners: [...]
];

export function getCurrentGame(): GameConfig {
    return GAME_CONFIG.find(g => g.status === 'active') || GAME_CONFIG[0];
}