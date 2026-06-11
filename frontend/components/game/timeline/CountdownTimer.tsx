import { memo } from "react";
import { useTimer } from "@/contexts/TimerContext";
import TimerRibbon from "./TimerRibbon";

interface CountdownTimerProps {
    endDate: string;
    ribbonColor?: string;
    expiredLabel?: string;
}

const CountdownTimer = memo(function CountdownTimer({ endDate, ribbonColor, expiredLabel = "ENDED" }: CountdownTimerProps) {
    const { getTimeLeft } = useTimer();
    const timeLeft = getTimeLeft(endDate);

    if (timeLeft <= 0) {
        return <TimerRibbon bgColor="bg-gray-600" textColor="text-white">{expiredLabel}</TimerRibbon>;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);

    let displayTime = "";
    if (days > 0) {
        displayTime = `${days}d ${hours}h`;
    } else if (hours > 0) {
        displayTime = `${hours}h ${minutes}m`;
    } else {
        displayTime = `${minutes}m`;
    }

    let bgColorClass = "bg-emerald-600";
    if (days < 2) {
        bgColorClass = "bg-red-600";
    } else if (days < 4) {
        bgColorClass = "bg-yellow-600";
    }

    return (
        <TimerRibbon bgColor={ribbonColor || bgColorClass} textColor="text-white">
            {displayTime}
        </TimerRibbon>
    );
});

export default CountdownTimer;
