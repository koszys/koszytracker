import Image from 'next/image';
import { SOCIAL_LINKS } from '../../../config/socials';

interface SocialButtonProps {
    type: 'discord' | 'kofi';
    variant?: 'full' | 'icon';
}

export default function SocialButton({ type, variant = 'full' }: SocialButtonProps) {
    const social = SOCIAL_LINKS[type];

    if (!social) {
        console.warn(`Unknown social type: ${type}`);
        return null;
    }

    const isIconOnly = variant === 'icon';
    const imageWidth = type === 'kofi' ? 20 : 20;
    const imageHeight = type === 'kofi' ? 16 : 20;

    return (
        <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                inline-flex items-center gap-2
                ${isIconOnly
                    ? `px-3 py-2 ${social.bgClass} border border-transparent hover:bg-inherit ${social.borderClass} text-white hover:text-white text-sm rounded transition-colors`
                    : `px-5 py-2 ${social.bgClass} border border-transparent hover:bg-inherit ${social.borderClass} text-white hover:text-white text-sm font-bold rounded transition-colors`
                }
            `}
            title={social.name}
        >
            <Image
                src={social.icon}
                alt={social.name}
                width={imageWidth}
                height={imageHeight}
                className={type === 'kofi' ? 'w-5 h-4' : 'w-5 h-5'}
            />
            {!isIconOnly && <span>{social.name}</span>}
        </a>
    );
}