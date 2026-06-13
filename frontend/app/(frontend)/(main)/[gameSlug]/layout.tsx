import { notFound } from "next/navigation";
import { GAME_CONFIG } from "@/config/games";
import { GameProvider } from "@/contexts/GameContext";
import DashboardLayoutContent from "./dashboard-layout-content";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ gameSlug: string }>;
}) {
    const { gameSlug } = await params;
    const game = GAME_CONFIG.find(g => g.id === gameSlug);
    if (!game || game.status === 'comingsoon') {
        notFound();
    }

    return (
        <GameProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </GameProvider>
    );
}
