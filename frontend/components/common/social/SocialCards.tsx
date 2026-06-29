import { SOCIAL_LINKS } from "../../../config/socials";
import SocialButton from "./SocialButton";

export default function SocialCards() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 mt-10">
            {/* Discord Card */}
            <div className={`bg-[#1c1d21]/70 border border-[#33343a] rounded-md p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-all duration-300 ${SOCIAL_LINKS.discord.shadowClass}`}>
                <div className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center p-3">
                    <img src={SOCIAL_LINKS.discord.icon} alt="Discord" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">Join the Community</h3>
                    <p className="text-gray-350 text-sm mb-4">
                        Join the discord server to share feedback, suggest features, and talk with other users! I appreciate any help on maintaining and improving this site, so feel free to reach out if you want to contribute. Thank you!
                    </p>
                    <SocialButton type="discord" variant="full" />
                </div>
            </div>

            {/* Ko-fi Card */}
            <div className={`bg-[#1c1d21]/70 border border-[#33343a] rounded-md p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-all duration-300 ${SOCIAL_LINKS.kofi.shadowClass}`}>
                <div className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center p-3">
                    <img src={SOCIAL_LINKS.kofi.icon} alt="Ko-fi" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">Support the Project</h3>
                    <p className="text-gray-350 text-sm mb-4">
                        The site currently runs ad-free and is being maintained by one person. If it helps you out in any way, consider supporting me on Ko-fi. I appreciate it!
                    </p>
                    <SocialButton type="kofi" variant="full" />
                </div>
            </div>
        </section>
    );
}
