import Link from 'next/link';

export default function AuthLayout({ children, params }: {
    children: React.ReactNode;
    params?: { locale?: string };
}) {
    const locale = params?.locale || 'en-in';

    return (
        <div className="auth-surface grid min-h-screen min-h-dvh w-full bg-[#050505] font-sans text-[#F5F5F5] antialiased selection:bg-[#242424] lg:grid-cols-2">
            <div className="flex min-w-0 items-center justify-center px-6 py-8 sm:px-10">
                <div className="w-full max-w-[460px]">
                    <Link
                        href={`/${locale}`}
                        className="mb-8 inline-flex items-center gap-2 rounded-[10px] text-base font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BDBDBD]"
                        aria-label="ResumeForge home"
                    >
                        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#242424] bg-[#101010] text-xs font-bold">RF</span>
                        ResumeForge
                    </Link>
                    {children}
                </div>
            </div>
            <aside aria-label="About ResumeForge" className="relative hidden min-h-screen overflow-hidden lg:block">
                <img
                    src="/auth-still.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-10 xl:p-14">
                    <p
                        className="max-w-[12ch] text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-[#f4f5f7]"
                        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                    >
                        A clear page. Then the right role.
                    </p>
                </div>
            </aside>
        </div>
    );
}
