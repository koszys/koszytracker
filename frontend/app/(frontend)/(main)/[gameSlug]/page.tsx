"use client";

import { useGame } from "@/contexts/GameContext";
import { useSettings } from "@/contexts/SettingsContext";
import { TimerProvider } from "@/contexts/TimerContext";
import GameIntro from "@/components/game/GameIntro";
import ToggleSection from "@/components/game/ToggleSection";
import ActiveCodes from "@/components/game/ActiveCodes";
import EventTimeline from "@/components/game/timeline/EventTimeline";
import ChangelogSection from "@/components/common/changelog/ChangelogSection";
import type { DashboardSection } from "@/config/games";

export default function HomePage() {
    const { activeGame: game } = useGame();
    const { activeAccount } = useSettings();

    return (
        <div className="w-full max-w-300 mx-auto pb-20">
            <GameIntro text={`Keep up to date with new banners, events, and updates in ${game.name}.`} />

            <TimerProvider>
                {renderSections(game.dashboardSections, game, activeAccount?.server)}
            </TimerProvider>

            {game.dashboardSections.some((s) => s === "codes" || s === "events") && (
                <ChangelogSection game={game.id} />
            )}
        </div>
    );
}

function renderSections(sections: DashboardSection[], game: ReturnType<typeof useGame>["activeGame"], activeServer?: string) {
    return sections.map((section) => {
        switch (section) {
            case "codes":
                return (
                    <ToggleSection key="codes" title="Active Codes" defaultOpen={true}>
                        <ActiveCodes game={game.id} redeemUrl={game.redeemUrl} />
                    </ToggleSection>
                );
            case "events":
                return (
                    <div key="events">
                        <ToggleSection title="Current Events" defaultOpen={true}>
                            <EventTimeline game={game.id} type="current" activeServer={activeServer} servers={game.servers} />
                        </ToggleSection>
                        <ToggleSection title="Upcoming Events" defaultOpen={true}>
                            <EventTimeline game={game.id} type="upcoming" activeServer={activeServer} servers={game.servers} />
                        </ToggleSection>
                    </div>
                );
            case "info":
                return game.aboutText ? (
                    <div key="info" className="bg-[#1c1d21]/70 border border-[#33343a] rounded-xl p-6 mb-4">
                        <p className="text-gray-300 text-sm leading-relaxed">{game.aboutText}</p>
                    </div>
                ) : null;
            default:
                return null;
        }
    });
}
