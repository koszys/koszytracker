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
    },
    {
        id: 'hsr',
        name: 'Honkai: Star Rail',
        path: '/hsr',
        bgUrl: '/assets/gamebackground/hsr_background.png',
        logoUrl: '/assets/genshin/genshin-logo.webp',
        iconUrl: '/assets/genshin/genshin-logo.webp',
        status: 'comingsoon',
        wishName: 'Warp Tracker',
        importName: 'Import Warps',
    },
    {
        id: 'zzz',
        name: 'Zenless Zone Zero',
        path: '/zzz',
        bgUrl: '/assets/gamebackground/zzz_background.jpg',
        logoUrl: '/assets/genshin/genshin-logo.webp',
        iconUrl: '/assets/genshin/genshin-logo.webp',
        status: 'comingsoon',
        wishName: 'Signal Tracker',
        importName: 'Import Signals',
    },
    {
        id: 'wuwa',
        name: 'Wuthering Waves',
        path: '/wuwa',
        bgUrl: '/assets/gamebackground/wuwa_background.jpg',
        logoUrl: '/assets/genshin/genshin-logo.webp',
        iconUrl: '/assets/genshin/genshin-logo.webp',
        status: 'comingsoon',
        wishName: 'Convene Tracker',
        importName: 'Import Convenes',
    },
];

export function getCurrentGame(): GameConfig {
    return GAME_CONFIG.find(g => g.status === 'active') || GAME_CONFIG[0];
}