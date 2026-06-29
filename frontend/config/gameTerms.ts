export interface GameTerms {
    ar?: string;
    arFull?: string;
    maxAr?: number;
    wl?: string;
    wlFull?: string;
    wlOptions?: string[];
    mcTitle?: string;
    mcMale?: string;
    mcFemale?: string;
}

export const gameTerms: Record<string, GameTerms> = {
    genshin: {
        ar: "AR",
        arFull: "Adventure Rank",
        maxAr: 60,
        wl: "WL",
        wlFull: "World Level",
        wlOptions: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        mcTitle: "Traveler",
        mcMale: "Aether",
        mcFemale: "Lumine"
    },
    hsr: {
        ar: "TL",
        arFull: "Trailblaze Level",
        maxAr: 70,
        wl: "EQ Level",
        wlFull: "Equilibrium Level",
        wlOptions: ["0", "1", "2", "3", "4", "5", "6"],
        mcTitle: "Trailblazer",
        mcMale: "Caelus",
        mcFemale: "Stelle"
    },
    wuwa: {
        ar: "UL",
        arFull: "Union Level",
        maxAr: 80,
        wl: "SP",
        wlFull: "SOL3 Phase",
        wlOptions: ["1", "2", "3", "4", "5", "6", "7", "8"],
        mcTitle: "Rover",
        mcMale: "Male",
        mcFemale: "Female"
    },
    zzz: {
        ar: "IL",
        arFull: "Inter-Knot Level",
        maxAr: 60,
        wl: "IR",
        wlFull: "Inter-Knot Reputation",
        wlOptions: ["Novice Proxy (0)", "Certified Proxy (1)", "Senior Proxy (2)", "Elite Proxy (3)", "Legendary Proxy (4)"],
        mcTitle: "Proxy",
        mcMale: "Wise",
        mcFemale: "Belle"
    }
};

export function getGameTerms(gameId: string): GameTerms {
    return gameTerms[gameId as keyof typeof gameTerms] ?? {};
}