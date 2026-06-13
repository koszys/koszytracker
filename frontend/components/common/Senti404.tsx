import Link from "next/link";

export default function Senti404() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-4 bg-black">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                style={{ backgroundImage: "url('/assets/senti404.webp')" }}
            />
            <div className="relative z-10">
                <h1 className="text-6xl font-black text-white tracking-widest mb-4">404</h1>
                <p className="text-gray-200 text-lg mb-8">
                    You went somewhere that doesn&apos;t exist! Senti will help send you back to the home page.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-theme text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
