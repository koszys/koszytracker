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
            <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-4 border-blue-500 pl-3 mt-12 mb-6 flex items-center justify-between">
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
