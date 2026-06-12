import type { GameConfig } from "./games";

export interface NavLink {
  name: string;
  path: string;
  icon: string;
  dynamicName?: string;
}

export const FEATURE_NAV_LINKS: Record<string, (game: GameConfig) => NavLink[]> = {
  tracker: (game) => [
    { name: "Wish Tracker", path: "/dashboard/tracker", icon: game.trackerIcon, dynamicName: game.trackerName },
    { name: "Import Wishes", path: "/dashboard/import", icon: game.importIcon, dynamicName: game.importName },
  ],
};
