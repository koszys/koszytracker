interface GameIntroProps {
    text: string;
}

export default function GameIntro({ text }: GameIntroProps) {
    if (!text) return null;

    return (
        <section className="mb-8 mt-6">
            <div className="relative w-full flex items-center justify-center">
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-wide uppercase drop-shadow-sm">
                        SENTI<span className="text-theme">.MOE</span>
                    </h1>
                    <p className="text-white text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        {text}
                    </p>
                </div>
            </div>
        </section>
    );
}
