import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full py-8 mt-auto border-t border-[#33343a] flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-semibold text-white">
            <p>Copyright &copy; 2026 koszy<span className="text-blue-500">.moe</span></p>

            <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-white hover:text-white transition-colors font-semibold">
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
}