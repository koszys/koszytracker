import type { ServerOption } from "@/config/games";

export function getServerOffset(server: string, servers: ServerOption[]): number {
    return servers.find(s => s.id === server)?.offset ?? -5;
}

function getServerDate(dateObj: Date, server: string, servers: ServerOption[]) {
    const offset = getServerOffset(server, servers);
    const shifted = new Date(dateObj.getTime() + (offset * 60 * 60 * 1000));
    return {
        day: shifted.getUTCDay(),
        date: shifted.getUTCDate()
    };
}

export function applyServerOffset(deadline: string, server: string, servers: ServerOption[]) {
    const offset = getServerOffset(server, servers);
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);
    const offsetStr = `${sign}${String(absOffset).padStart(2, "0")}:00`;
    const cleanDeadline = deadline.split("+")[0].replace("Z", "");
    return new Date(`${cleanDeadline}${offsetStr}`).toISOString();
}

export function getServerResetUTC(server: string, servers: ServerOption[]) {
    const defaultHours: Record<string, number> = {
        America: 9,
        Europe: 3,
        Asia: 20,
    };
    return defaultHours[server] ?? 9;
}

export const REFERENCE_SERVER = "America";

export function getServerTimeShift(server: string, servers: ServerOption[]): number {
    const refReset = getServerResetUTC(REFERENCE_SERVER, servers);
    const targetReset = getServerResetUTC(server, servers);
    if (targetReset <= refReset) return targetReset - refReset;
    return targetReset - refReset - 24;
}

export function adjustEventsForServer<T extends { start: string; end: string }>(
    events: T[],
    server?: string,
    serverOptions?: ServerOption[]
): T[] {
    if (!server || !serverOptions || server === REFERENCE_SERVER) return events;
    const shiftMs = getServerTimeShift(server, serverOptions) * 3_600_000;
    if (shiftMs === 0) return events;
    return events.map(e => ({
        ...e,
        start: new Date(new Date(e.start).getTime() + shiftMs).toISOString(),
        end: new Date(new Date(e.end).getTime() + shiftMs).toISOString(),
    }));
}

export const getNextReset = (rule: string, resetHourUTC: number, server: string, servers: ServerOption[]) => {
    const now = new Date();
    let target = new Date();

    target.setUTCHours(resetHourUTC, 0, 0, 0);
    if (now >= target) target.setUTCDate(target.getUTCDate() + 1);

    switch (rule) {
        case "daily":
            break;
        case "weekly":
            while (getServerDate(target, server, servers).day !== 1) {
                target.setUTCDate(target.getUTCDate() + 1);
            }
            break;
        case "monthly":
            while (getServerDate(target, server, servers).date !== 1) {
                target.setUTCDate(target.getUTCDate() + 1);
            }
            break;
        case "monthly-16th":
            while (getServerDate(target, server, servers).date !== 16) {
                target.setUTCDate(target.getUTCDate() + 1);
            }
            break;
    }
    return target.toISOString();
};

export const getNextResetAfter = (baseDate: Date, rule: string, resetHourUTC: number, server: string, servers: ServerOption[]) => {
    const target = new Date(baseDate);
    target.setUTCHours(resetHourUTC, 0, 0, 0);
    if (target <= baseDate) target.setUTCDate(target.getUTCDate() + 1);

    switch (rule) {
        case "daily":
            break;
        case "weekly":
            while (getServerDate(target, server, servers).day !== 1) {
                target.setUTCDate(target.getUTCDate() + 1);
            }
            break;
        case "monthly":
            while (getServerDate(target, server, servers).date !== 1) {
                target.setUTCDate(target.getUTCDate() + 1);
            }
            break;
        case "monthly-16th":
            while (getServerDate(target, server, servers).date !== 16) {
                target.setUTCDate(target.getUTCDate() + 1);
            }
            break;
    }

    return target;
};
