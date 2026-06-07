export interface GachaMechanics {
    pityCaps: Record<string, {
        fiveStar: number;
        fourStar: number;
    }>;
}

export const GACHA_MECHANICS: Record<string, GachaMechanics> = {
    genshin: {
        pityCaps: {
            character:   { fiveStar: 90, fourStar: 10 },
            weapon:      { fiveStar: 80, fourStar: 10 },
            standard:    { fiveStar: 90, fourStar: 10 },
            chronicled:  { fiveStar: 90, fourStar: 10 },
        },
    },
    wuwa: {
        pityCaps: {
            character:          { fiveStar: 80, fourStar: 10 },
            weapon:             { fiveStar: 80, fourStar: 10 },
            characterpermanent: { fiveStar: 80, fourStar: 10 },
            weaponpermanent:    { fiveStar: 80, fourStar: 10 },
        },
    },
};

export function getPityCap(gameId: string, bannerType: string, rarity: 'fiveStar' | 'fourStar' = 'fiveStar'): number {
    const cap = GACHA_MECHANICS[gameId]?.pityCaps[bannerType]?.[rarity];
    if (cap === undefined) {
        console.warn(`Missing ${rarity} pityCap for "${gameId}" banner type "${bannerType}" — is gachaMechanics.ts up to date?`);
        return rarity === 'fiveStar' ? 90 : 10;
    }
    return cap;
}
