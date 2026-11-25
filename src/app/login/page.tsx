import { signIn } from "@/auth";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = await searchParams;

  return (
    <main className="min-h-screen w-full bg-[#0B0D10] flex items-center justify-center p-4 selection:bg-[#2563EB]/25 selection:text-[#F3F4F6]">
      <div className="w-full max-w-[360px] bg-[#14171D] border border-white/[0.08] rounded-[10px] p-8 shadow-none">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-[20px] font-semibold text-[#F3F4F6] tracking-[-0.015em]">
            Kova
          </span>
          <p className="mt-1.5 text-xs text-[#8A93A2]">
            Precision video conferencing
          </p>
        </div>

        {/* Error notification if OAuth signin failed */}
        {error && (
          <div className="mb-4 px-3 py-2 border border-[#EF4444]/30 bg-[#EF4444]/10 rounded-md text-xs text-[#EF4444] text-center">
            Authentication failed. Please try again.
          </div>
        )}

        {/* Primary Action */}
        <form
          action={async () => {
            "use server";
            await signIn("google", {
              redirectTo: callbackUrl || "/dashboard",
            });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#1C2028] hover:bg-white/[0.06] text-[#F3F4F6] text-sm font-medium border border-white/[0.08] rounded-md transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-1 focus:ring-[#2563EB] active:scale-[0.99] cursor-pointer"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.35 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>
      </div>
    </main>
  );
}
