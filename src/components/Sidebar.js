'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Database, 
  Network, 
  Sliders, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Gift, 
  Percent, 
  Coins, 
  Bot, 
  Gamepad2, 
  Award, 
  Briefcase 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navSections = [
    {
      title: 'Bot & Economy Controls',
      items: [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/bot-config', label: 'Bot Status & Maint.', icon: Bot },
        { href: '/prices', label: 'Price Setter', icon: Coins },
        { href: '/luck', label: 'Drop Rates & Luck', icon: Percent },
        { href: '/signature-box', label: 'Signature Box', icon: Gift },
        { href: '/economy-config', label: 'Economy & Rewards', icon: Briefcase },
        { href: '/gameplay-config', label: 'Gameplay & Matches', icon: Gamepad2 },
        { href: '/season-sbc', label: 'Season Pass & SBCs', icon: Award },
      ]
    },
    {
      title: 'Cards & Database',
      items: [
        { href: '/leaks', label: 'Leaks Drafts', icon: Flame },
        { href: '/cards', label: 'Card Database', icon: Sparkles },
        { href: '/custom-cards', label: 'Custom Cards', icon: PlusCircle },
        { href: '/formations', label: 'Formations 3D', icon: Network },
        { href: '/admin-commands', label: 'Admin Commands', icon: Sliders },
        { href: '/database', label: 'Cloud Tables', icon: Database },
      ]
    }
  ];

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen p-5 flex flex-col justify-between glass-card rounded-none border-r border-purple-900/20 z-40 bg-[#0e0a17]/80 backdrop-blur-2xl overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-3 mb-6 px-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-600/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none tracking-tight text-neutral-100">DestiFC</h1>
            <span className="text-[10px] text-pink-400 font-semibold tracking-wider uppercase">Admin Control Suite</span>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto pr-1 pb-4 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title}>
              <h2 className="px-3 text-[10px] font-bold tracking-wider text-purple-300/60 uppercase mb-2">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-500/30 shadow-sm shadow-pink-500/10 font-bold'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-400' : 'text-neutral-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-purple-900/20 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 text-xs font-semibold text-pink-400 hover:bg-pink-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Lock / Sign Out
        </button>
      </div>
    </aside>
  );
}
