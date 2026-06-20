export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col-reverse md:flex-row overflow-hidden md:h-screen w-screen bg-[#0d0d0d] font-sans">
            
            {/* Left Panel: Form Container (50% on Desktop) */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-12 bg-[#0d0d0d] overflow-y-auto relative z-10">
                <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center">
                    {children}
                </div>
            </div>

            {/* Right Panel: Illustration (50% on Desktop, bg-[#6B3FE7]) */}
            <div className="w-full md:w-1/2 h-[200px] md:h-screen flex items-center justify-center bg-[#6B3FE7] overflow-hidden">
                <img
                    src="/images/auth-side.png?v=welcome-pixelart"
                    alt="ResumeForgeAI Cinematic Auth Visual"
                    className="h-[160px] md:h-auto md:max-h-[85vh] w-auto object-contain"
                />
            </div>
            
        </div>
    );
}

