
export const GACHA_TYPE_MAP: Record<string, Record<number, string>> = {
    genshin: {
        301: "character",
        302: "weapon",
        303: "standard",
        304: "chronicled"
    },
    wuwa: {
        // Add later
    }
}

export function getBannerId(gameId: string, gachaType: number): string | undefined {
    return GACHA_TYPE_MAP[gameId]?.[gachaType]
}