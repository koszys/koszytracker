import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full py-8 mt-auto border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-semibold text-white">
            <p>Copyright &copy; 2026 senti<span className="text-theme">.moe</span></p>

            <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-white hover:text-white transition-colors font-semibold">
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
}