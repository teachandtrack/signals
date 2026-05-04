import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SigInt | Signal Intelligence",
  description: "Semiconductor Signal Intelligence Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-zinc-800 bg-[#121214] flex flex-col hidden md:flex z-10">
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                SigInt
              </span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavItem href="/" icon="inbox" label="Review Queue" />
            <NavItem href="/portfolio" icon="folder" label="Portfolio & Risk" />
            <NavItem href="#" icon="chart" label="Watchlist" />
            <NavItem href="#" icon="shield" label="Compliance" />
          </nav>
          
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                OP
              </div>
              <div>
                <p className="text-sm font-medium">Operator</p>
                <p className="text-xs text-zinc-400">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <header className="h-16 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-8 z-10">
            <h1 className="text-lg font-semibold tracking-tight">SigInt Dashboard</h1>
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Engine Active
              </span>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-8 z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  // Hardcoding active states for simplicity in this demo, in a real app use usePathname()
  const isActive = href === "/" ? false : false; // Placeholder, real app uses Next Router
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50`}
    >
      <div className={`transition-transform duration-200 group-hover:scale-110`}>
        {icon === "inbox" && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
        {icon === "chart" && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
        {icon === "folder" && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
        {icon === "shield" && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
      </div>
      {label}
    </Link>
  );
}

