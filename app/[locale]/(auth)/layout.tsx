export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col-reverse md:flex-row overflow-hidden md:h-screen w-screen bg-[#0d0d0d] font-sans">
            
            {/* Left Panel: Form Container (50% on Desktop) */}
            <div 
                className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-12 overflow-y-auto relative z-10 border-r border-white/5"
                style={{ background: 'radial-gradient(ellipse at top left, #1e1040 0%, #0d0d0d 60%)' }}
            >
                {/* Subtle purple glow in top-left */}
                <div className="absolute w-64 h-64 bg-purple-600/10 blur-3xl rounded-full top-0 left-0 pointer-events-none" />

                <div className="w-full max-w-[400px] mx-auto flex flex-col justify-center relative z-10">
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

