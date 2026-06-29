import type { ReactNode } from "react";

interface TimerRibbonProps {
    children: ReactNode;
    bgColor?: string;
    textColor?: string;
}

export default function TimerRibbon({ children, bgColor = "bg-[#33343a]", textColor = "text-gray-400" }: TimerRibbonProps) {
    return (
        <div className={`${bgColor} ${textColor} text-[10px] md:text-[12px] font-black px-3 py-1 rounded-tr-xl rounded-bl-lg uppercase tracking-wider shadow-md transition-colors duration-500`}>
            {children}
        </div>
    );
}
