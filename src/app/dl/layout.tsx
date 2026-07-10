import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Direct Download | SWC Library",
    template: "%s | SWC CDN",
  },
  description: "Direct CDN download for Nintendo Switch ROMs.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DirectDownloadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      <header className="border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <a href="https://swclibrary.online" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-red to-brand-purple flex items-center justify-center text-white font-black text-sm shadow-lg">
            S
          </span>
          <span className="font-black text-text-primary text-sm tracking-tight group-hover:text-brand-red transition-colors">
            SWC Library
          </span>
          <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-full ml-1">
            CDN
          </span>
        </a>
        <span className="text-[10px] text-text-secondary font-mono">
          dl.swclibrary.online
        </span>
      </header>

      <main className="flex flex-col flex-1">
        {children}
      </main>

      <footer className="border-t border-white/5 py-4 px-6 text-center">
        <p className="text-[10px] text-text-secondary">
          &copy; {new Date().getFullYear()} SWC Library
        </p>
      </footer>
    </div>
  );
}
