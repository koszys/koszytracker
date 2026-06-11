"use client";

import { useGame } from "@/contexts/GameContext";
import { TimerProvider } from "@/contexts/TimerContext";
import GameIntro from "@/components/game/GameIntro";
import ToggleSection from "@/components/game/ToggleSection";
import ActiveCodes from "@/components/game/ActiveCodes";
import EventTimeline from "@/components/game/timeline/EventTimeline";
import ChangelogSection from "@/components/common/ChangelogSection";

export default function HomePage() {
    const { activeGame: game } = useGame();

    return (
        <div className="w-full max-w-300 mx-auto pb-20">
            <GameIntro text={`Keep up to date with new banners, events, and updates in ${game.name}.`} />

            <TimerProvider>
                <ToggleSection title="Active Codes" defaultOpen={true}>
                    <ActiveCodes game={game.id} redeemUrl={game.redeemUrl} />
                </ToggleSection>

                <ToggleSection title="Current Events" defaultOpen={true}>
                    <EventTimeline game={game.id} type="current" />
                </ToggleSection>

                <ToggleSection title="Upcoming Events" defaultOpen={true}>
                    <EventTimeline game={game.id} type="upcoming" />
                </ToggleSection>
            </TimerProvider>

            {/* Hidden changelog */}
            <section className="mt-12 hidden">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-4 border-theme pl-3 mb-6">
                    Changelog
                </h2>
                <ChangelogSection game={game.id} />
            </section>
        </div>
    );
}
