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
        bgUrl: '/assets/gamebackground/genshin_background.webp',
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
        wishName: 'StarRail Wishes',
        importName: 'Import Wishes',
    },
    {
        id: 'zzz',
        name: 'Zenless Zone Zero',
        path: '/zzz',
        bgUrl: '/assets/gamebackground/zzz_background.jpg',
        logoUrl: '/assets/genshin/genshin-logo.webp',
        iconUrl: '/assets/genshin/genshin-logo.webp',
        status: 'comingsoon',
        wishName: 'ZZZ Wishes',
        importName: 'Import Wishes',
    },
    {
        id: 'wuwa',
        name: 'Wuthering Waves',
        path: '/wuwa',
        bgUrl: '/assets/gamebackground/wuwa_background.jpg',
        logoUrl: '/assets/genshin/genshin-logo.webp',
        iconUrl: '/assets/genshin/genshin-logo.webp',
        status: 'comingsoon',
        wishName: 'Wuthering Wishes',
        importName: 'Import Wishes',
    },
];

export function getCurrentGame(): GameConfig {
    return GAME_CONFIG.find(g => g.status === 'active') || GAME_CONFIG[0];
}