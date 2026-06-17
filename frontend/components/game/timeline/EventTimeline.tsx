import { useState, useEffect, memo, useMemo, useRef } from "react";
import CountdownTimer from "./CountdownTimer";
import { fetchEvents } from "@/data/fetchEvents";
import type { GameEvent } from "@/data/types";
import { event_labels } from "@/config/labelsAndTags";
import { getServerOffset, adjustEventsForServer } from "@/utils/serverTime";
import type { ServerOption } from "@/config/games";

interface EventTimelineProps {
    game: string;
    type?: "all" | "current" | "upcoming";
    activeServer?: string;
    servers?: ServerOption[];
}

const EventCard = memo(function EventCard({ event, isCurrent, game }: { event: GameEvent; isCurrent: boolean; game: string }) {
    const imageUrl =
        typeof event.image === "object" && event.image?.value
        ? event.image.value.url
        : null;
    const hasImage = !!imageUrl;
    const isBanner = event.type?.toLowerCase() === "banner";
    const resolvedLabel = event.label
        ? event_labels[game]?.[event.label.toUpperCase()]
        : undefined;

    return (
        <div className={`relative flex items-center bg-[#1c1d21]/80 border border-[#33343a] rounded-xl p-3 min-h-[6rem] shadow-sm hover:border-[#4b4c53] transition-colors group ${!isCurrent ? "opacity-70 hover:opacity-100 transition-opacity" : ""}`}>

            <div className={`shrink-0 flex items-center justify-center mr-4 overflow-hidden ${
                isBanner
                    ? "w-12 h-12 md:w-14 md:h-14 rounded-md"
                    : "w-24 h-14 md:w-32 md:h-16 rounded-md"
            }`}>
                {hasImage && (
                    <img
                        src={imageUrl!}
                        alt={event.name}
                        className={`w-full h-full drop-shadow-md group-hover:scale-105 transition-transform ${
                            isBanner ? "object-contain" : "object-cover"
                        }`}
                    />
                )}
            </div>

            <div className="flex flex-col flex-1 justify-center min-w-0 pr-20">
                <div className={`flex ${isBanner ? "items-center gap-2 mb-1.5" : "flex-col items-start gap-1.5"}`}>
                    {resolvedLabel && !isBanner && (
                        <span className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded w-max ${resolvedLabel.bgColor} ${resolvedLabel.textColor}`}>
                            {resolvedLabel.text}
                        </span>
                    )}
                    <h3 className="text-white font-bold text-sm md:text-base leading-tight truncate w-full">
                        {event.name}
                    </h3>
                </div>

                {isBanner && event.bannerData && (
                    <div className="flex items-center gap-1.5 mt-2">
                        {event.bannerData.featuredChars?.map((char, idx) => (
                            <div key={`char-${idx}`} className="relative group/tooltip flex-shrink-0">
                                <img
                                    src={char.icon}
                                    alt={char.name}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-orange-400 bg-orange-200/20 object-cover shadow-sm cursor-help"
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#121212] border border-[#33343a] text-white text-xs font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    {char.name}
                                </div>
                            </div>
                        ))}

                        {event.bannerData.featuredWeapons?.map((weapon, idx) => (
                            <div key={`weapon-${idx}`} className="relative group/tooltip flex-shrink-0">
                                <img
                                    src={weapon.icon}
                                    alt={weapon.name}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-orange-400 bg-orange-200/20 object-cover shadow-sm cursor-help"
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#121212] border border-[#33343a] text-white text-xs font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    {weapon.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="absolute top-0 right-0 z-10">
                <CountdownTimer
                    endDate={isCurrent ? event.end : event.start}
                    ribbonColor={!isCurrent ? "bg-theme" : undefined}
                    expiredLabel={!isCurrent ? "LIVE" : "ENDED"}
                />
            </div>
        </div>
    );
});

import { useGame } from "@/contexts/GameContext";

export default function EventTimeline({ game, type = "all", activeServer, servers }: EventTimelineProps) {
    const { isDraftMode } = useGame();
    const [fetchedEvents, setFetchedEvents] = useState<GameEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<GameEvent[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const isRealtimeUpdateRef = useRef(false);

    useEffect(() => {
        const handleRefresh = () => {
            isRealtimeUpdateRef.current = true;
            setRefreshKey((k) => k + 1);
        };
        window.addEventListener("senti-refresh-active-game", handleRefresh);
        return () => {
            window.removeEventListener("senti-refresh-active-game", handleRefresh);
        };
    }, []);

    const rawEvents = useMemo(
        () => adjustEventsForServer(fetchedEvents, activeServer, servers),
        [fetchedEvents, activeServer, servers]
    );

    useEffect(() => {
        async function loadEvents() {
            setLoading(true);
            const data = await fetchEvents(game, isDraftMode, isRealtimeUpdateRef.current);
            setFetchedEvents(data);
            setLoading(false);
            isRealtimeUpdateRef.current = false;
        }

        if (game) {
            loadEvents();
        } else {
            console.warn("EventTimeline is missing the 'game' prop!");
            setLoading(false);
        }
    }, [game, isDraftMode, refreshKey]);

    useEffect(() => {
        if (!rawEvents || rawEvents.length === 0) {
            setCurrentEvents([]);
            setUpcomingEvents([]);
            return;
        }
        const now = new Date();
        const current: GameEvent[] = [];
        const upcoming: GameEvent[] = [];

        rawEvents.forEach(event => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            if (now > startDate && now < endDate) {
                current.push(event);
            } else if (now < startDate) {
                upcoming.push(event);
            }
        });

        current.sort((a, b) => new Date(a.end).getTime() - new Date(b.end).getTime());
        upcoming.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        setCurrentEvents(current);
        setUpcomingEvents(upcoming);
    }, [rawEvents]);

    const eventsToShow = useMemo(() => {
        if (type === "current") return currentEvents;
        if (type === "upcoming") return upcomingEvents;
        return currentEvents.concat(upcomingEvents);
    }, [type, currentEvents, upcomingEvents]);

    if (loading) return <div className="text-gray-400 p-4">Loading timeline...</div>;
    if (!eventsToShow.length) return null;

    const serverOffset = activeServer && servers ? getServerOffset(activeServer, servers) : null;

    return (
        <div className="space-y-3">
            {serverOffset !== null && (
                <div className="flex items-center gap-2 text-xs text-gray-200">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {activeServer} ({serverOffset >= 0 ? "+" : ""}{serverOffset} UTC)
                    </span>
                </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {eventsToShow.map(event => {
                    const isCurrent = currentEvents.some(e => e.id === event.id);
                    return <EventCard key={event.id} event={event} isCurrent={isCurrent} game={game} />;
                })}
            </div>
        </div>
    );
}
