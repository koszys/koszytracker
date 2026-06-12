export const event_labels = {
    genshin: {
        VERSION: { text: "New Version", bgColor: "bg-teal-900/40", textColor: "text-teal-300" },
        WEB: { text: "Web Event", bgColor: "bg-emerald-900/40", textColor: "text-emerald-300" },
        STREAM: { text: "Livestream", bgColor: "bg-sky-900/40", textColor: "text-sky-300" },
        WORLD_EXPL: { text: "World Exploration", bgColor: "bg-green-900/40", textColor: "text-green-300" },
        LOGIN: { text: "Login Event", bgColor: "bg-rose-900/40", textColor: "text-rose-300" },
        TCG: { text: "TCG", bgColor: "bg-teal-900/40", textColor: "text-teal-300" }
    },
    hsr: {},
    zzz: {},
    wuwa: {}
};

export const game_tags = {
    genshin: {
        PERMANENT: { id: "permanent", text: "Permanent", bgColor: "bg-orange-900/40", textColor: "text-orange-400" },
        DAILY: { id: "daily", text: "Daily", bgColor: "bg-purple-900/40", textColor: "text-purple-300" },
        EVENTS: { id: "events", text: "Events", bgColor: "bg-amber-900/40", textColor: "text-amber-300" },

        WISHES: { id: "wishes", text: "Event Wishes", bgColor: "bg-pink-900/40", textColor: "text-pink-300", parentId: "events" },
        CHECK_IN: { id: "checkin", text: "Check In", bgColor: "bg-sky-900/40", textColor: "text-sky-300", parentId: "events" },
        TCG: { id: "tcg", text: "TCG", bgColor: "bg-teal-900/40", textColor: "text-teal-300", parentId: "events" },
        QUEST: { id: "quest", text: "Quests", bgColor: "bg-blue-900/40", textColor: "text-blue-300", parentId: "events" },
        WORLD_EXPL: { id: "world_exploration", text: "World Exploration", bgColor: "bg-green-900/40", textColor: "text-green-300", parentId: "events" }
    },
    hsr: {
        PERMANENT: { id: "permanent", text: "Permanent", bgColor: "bg-orange-900/40", textColor: "text-orange-400" },
        DAILY: { id: "daily", text: "Daily", bgColor: "bg-purple-900/40", textColor: "text-purple-300" },
        EVENTS: { id: "events", text: "Events", bgColor: "bg-amber-900/40", textColor: "text-amber-300" },

        WARPS: { id: "wishes", text: "Event Warps", bgColor: "bg-pink-900/40", textColor: "text-pink-300", parentId: "events" }
    }
};