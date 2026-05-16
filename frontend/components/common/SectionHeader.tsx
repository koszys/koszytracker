interface SectionHeaderProps {
    title: string;
    onToggle?: () => void;
    isExpanded?: boolean;
    isToggleable?: boolean;
}

export default function SectionHeader({ title, onToggle, isExpanded, isToggleable }: SectionHeaderProps) {
    return (
        <div
            onClick={isToggleable ? onToggle : undefined}
            className={isToggleable ? "cursor-pointer sm:cursor-default" : ""}
        >
            <h2 className="text-xl font-bold text-white uppercase tracking-wider pl-3 mt-12 mb-6 flex items-center justify-between relative">
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-theme-from to-theme-to rounded-full shadow-[0_0_8px_var(--theme-glow)]"></span>
                <span>{title}</span>
                {isToggleable && (
                    <span className="sm:hidden text-sm font-normal text-gray-400">
                        {isExpanded ? '−' : '+'}
                    </span>
                )}
            </h2>
        </div>
    );
}
