interface ChangelogItemProps {
    version: string;
    date: string;
    changes: string[];
}

export default function ChangelogItem({ version, date, changes }: ChangelogItemProps) {
    return (
        <div className="border-l border-[#33343a] ml-2 pl-6 relative pb-6 last:pb-0">
            <div className="absolute w-2 h-2 bg-theme rounded-full left-[4.5px] top-2" />
            <div className="flex items-baseline gap-3 mb-2">
                <h4 className="text-white font-bold">{version}</h4>
                <span className="text-xs text-gray-200">{date}</span>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-350 space-y-1">
                {changes.map((change, i) => (
                    <li key={i}>{change}</li>
                ))}
            </ul>
        </div>
    );
}
