'use client';
import { useState, useEffect } from 'react';
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
  Briefcase,
  Activity,
  Server,
  Users,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch logged-in user permissions
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navSections = [
    {
      title: 'Bot & Hosting Controls',
      items: [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard' },
        { href: '/hosting', label: 'Hosting & Process Control', icon: Server, perm: 'hosting' },
        { href: '/diagnostics', label: 'Command Health & Ping', icon: Activity, perm: 'diagnostics' },
        { href: '/bot-config', label: 'Bot Status & Maint.', icon: Bot, perm: 'bot-config' },
        { href: '/prices', label: 'Price Setter', icon: Coins, perm: 'prices' },
        { href: '/luck', label: 'Drop Rates & Luck', icon: Percent, perm: 'luck' },
        { href: '/signature-box', label: 'Signature Box', icon: Gift, perm: 'signature-box' },
        { href: '/economy-config', label: 'Economy & Rewards', icon: Briefcase, perm: 'economy-config' },
        { href: '/gameplay-config', label: 'Gameplay & Matches', icon: Gamepad2, perm: 'gameplay-config' },
        { href: '/season-sbc', label: 'Season Pass & SBCs', icon: Award, perm: 'season-sbc' },
      ]
    },
    {
      title: 'Cards, Tools & Users',
      items: [
        { href: '/leaks', label: 'Leaks Drafts', icon: Flame, perm: 'leaks' },
        { href: '/cards', label: 'Card Database', icon: Sparkles, perm: 'cards' },
        { href: '/custom-cards', label: 'Custom Cards', icon: PlusCircle, perm: 'custom-cards' },
        { href: '/formations', label: 'Formations 3D', icon: Network, perm: 'formations' },
        { href: '/admin-commands', label: 'Admin Commands', icon: Sliders, perm: 'admin-commands' },
        { href: '/database', label: 'Cloud Tables', icon: Database, perm: 'database' },
        { href: '/users', label: 'Team & Access Control', icon: Users, perm: 'users' },
      ]
    }
  ];

  const userPerms = user?.permissions || ['all'];
  const hasPerm = (permKey) => {
    if (userPerms.includes('all')) return true;
    return userPerms.includes(permKey);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0e0a17]/95 border-b border-purple-900/30 backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-fuchsia-600/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white">DestiFC</h1>
            <span className="text-[9px] text-pink-400 font-semibold uppercase">Admin Suite</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-neutral-900 border border-purple-900/40 text-neutral-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-pink-400" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`w-64 fixed top-0 left-0 h-screen p-5 flex flex-col justify-between glass-card rounded-none border-r border-purple-900/20 z-50 bg-[#0e0a17]/95 lg:bg-[#0e0a17]/80 backdrop-blur-2xl overflow-hidden transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 px-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-600/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-none tracking-tight text-neutral-100">DestiFC</h1>
                <span className="text-[10px] text-pink-400 font-semibold tracking-wider uppercase">Admin Control Suite</span>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="mb-4 px-3 py-2 rounded-2xl bg-neutral-950/70 border border-purple-900/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center justify-center text-[10px] font-black shrink-0">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white leading-none truncate">@{user.username}</p>
                  <span className="text-[9px] text-neutral-400 uppercase font-semibold">{user.role}</span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 shrink-0" />
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 space-y-6 overflow-y-auto pr-1 pb-4 scrollbar-thin">
            {navSections.map((section) => {
              const visibleItems = section.items.filter(item => hasPerm(item.perm));
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title}>
                  <h2 className="px-3 text-[10px] font-bold tracking-wider text-purple-300/60 uppercase mb-2">
                    {section.title}
                  </h2>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
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
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="pt-4 border-t border-purple-900/20 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 text-xs font-semibold text-pink-400 hover:bg-pink-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

