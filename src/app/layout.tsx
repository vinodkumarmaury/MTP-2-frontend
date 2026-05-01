import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title: 'MEM — Mine Evaluation Model', description: 'OC Coal Mine Evaluation · IIT Kharagpur' };

const NAV = [
  { href:'/',            label:'Home' },
  { href:'/predict',     label:'Predict' },
  { href:'/compare',     label:'Compare' },
  { href:'/history',     label:'History' },
  { href:'/parameters',  label:'Parameters' },
  { href:'/workflow',    label:'Workflow' },
  { href:'/sensitivity', label:'Sensitivity' },
  { href:'/data',        label:'Mine Data' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <nav className="bg-[#1F3864] sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#2E75B6] rounded-lg flex items-center justify-center font-bold text-white text-sm">M</div>
              <div>
                <div className="font-bold text-white text-sm leading-none">MCIF</div>
                <div className="text-blue-300 text-[9px] leading-none">OC Coal Mine Evaluation</div>
              </div>
            </Link>
            <div className="flex gap-0.5 overflow-x-auto">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} className="px-3 py-1.5 text-xs text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all whitespace-nowrap">
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="hidden lg:block text-blue-300 text-[10px]">IIT Kharagpur · 2026</div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <footer className="bg-[#1F3864] text-blue-300 text-xs text-center py-3 mt-8">
          MCIF v3.0 · 7 Dimensions · 150+ Parameters · 12 OC Coal Mines · IIT Kharagpur Mining Engineering · 2026
        </footer>
      </body>
    </html>
  );
}
