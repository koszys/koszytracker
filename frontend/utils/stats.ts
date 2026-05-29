import { WishData } from "@/hooks/useWishes"
import { GameConfig } from "@/config/games"
import { getBannerId } from "./gachaTypes"

export interface BannerStats {
    total: number;
    fiveStar: number;
    fourStar: number;
    currentPity5: number;
    currentPity4: number;
    avgPity5: number;
    winRate5050: number;
}

export function computeBannerStats(wishes: WishData[], game: GameConfig): Record<string, BannerStats> {
    const groups: Record<string, WishData[]> = {};

    for (const wish of wishes) {
        const bannerId = getBannerId(game.id, wish.gacha_type);
        if (!bannerId) continue;
        if (!groups[bannerId]) groups[bannerId] = [];
        groups[bannerId].push(wish);
    }

    const result: Record<string, BannerStats> = {};

    for (const [bannerId, bannerWishes] of Object.entries(groups)) {
        const sorted = [...bannerWishes].sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        const total = sorted.length;
        const fiveStar = sorted.filter((w) => w.rarity === 5).length;
        const fourStar = sorted.filter((w) => w.rarity === 4).length;

        let currentPity5 = total;
        for (let i = total - 1; i >= 0; i--) {
            if (sorted[i].rarity === 5) {
                currentPity5 = total - 1 - i;
                break;
            }
        }

        let currentPity4 = total;
        for (let i = total - 1; i >= 0; i--) {
            if (sorted[i].rarity === 4) {
                currentPity4 = total - 1 - i;
                break;
            }
        }

        let avgPity5 = 0;
        if (fiveStar > 0) {
            const pities: number[] = [];
            let lastIdx = -1;
            for (let i = 0; i < total; i++) {
                if (sorted[i].rarity === 5) {
                    pities.push(i - lastIdx);
                    lastIdx = i;
                }
            }
            avgPity5 = Math.round(pities.reduce((a, b) => a + b, 0) / pities.length);
        }

        result[bannerId] = {
            total,
            fiveStar,
            fourStar,
            currentPity5,
            currentPity4,
            avgPity5,
            winRate5050: 0,
        };
    }

    return result;
}

export function computeWishPity(wishes: WishData[], game: GameConfig): (WishData & { pity: number })[] {
    const groups: Record<string, WishData[]> = {};

    for (const wish of wishes) {
        const bannerId = getBannerId(game.id, wish.gacha_type);
        if (!bannerId) continue;
        if (!groups[bannerId]) groups[bannerId] = [];
        groups[bannerId].push(wish);
    }

    const result: (WishData & { pity: number })[] = [];

    for (const bannerWishes of Object.values(groups)) {
        const sorted = [...bannerWishes].sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        let pityCount = 0;
        for (const wish of sorted) {
            pityCount++;
            result.push({ ...wish, pity: pityCount });
            if (wish.rarity === 5) pityCount = 0;
        }
    }

    return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}
