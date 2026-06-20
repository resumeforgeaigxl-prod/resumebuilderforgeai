export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#070710] text-white flex flex-col font-sans">
            {/* 1440px Centered Container */}
            <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col relative">
                
                {/* Content Section - Full Screen Height */}
                <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
                    
                    {/* Left Panel: Form Container (Fixed Width 520px on Desktop) */}
                    <div className="w-full md:w-[520px] shrink-0 flex flex-col justify-center px-[56px] py-10 overflow-y-auto relative z-10">
                        <div className="w-full max-w-[560px] mx-auto flex flex-col justify-center flex-1">
                            {children}
                        </div>
                    </div>

                    {/* Right Panel: Flexible illustration covers remaining space */}
                    <div className="flex-1 h-full relative overflow-hidden bg-black flex items-center justify-center">
                        <img
                            src="/images/auth-side.png?v=welcome-pixelart"
                            alt="ResumeForgeAI Cinematic Auth Visual"
                            className="w-full h-full object-cover object-center aspect-[16/10]"
                        />
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
