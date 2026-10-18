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
            <aside
                aria-label="About ResumeForge"
                className="hidden min-w-0 items-center justify-center border-l border-[#242424] bg-[#151515] px-12 py-16 lg:flex xl:px-16"
            >
                <div className="w-full max-w-[540px] space-y-4">
                    <h2 className="!font-sans !text-[32px] font-semibold leading-tight tracking-tight text-[#F5F5F5] xl:!text-[36px]">
                        Your AI job agent.
                    </h2>
                    <p className="text-base leading-7 text-[#BDBDBD]">
                        Find the right jobs, tailor your resume, prepare applications, and move faster with Omni.
                    </p>
                </div>
            </aside>
        </div>
    );
}
