'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Database, Network, Sliders, LogOut, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin-commands', label: 'Admin Commands', icon: Sliders },
    { href: '/custom-cards', label: 'Custom Cards', icon: PlusCircle },
    { href: '/database', label: 'Database', icon: Database },
    { href: '/formations', label: 'Formations 3D', icon: Network },
  ];

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen p-6 flex flex-col justify-between glass-card rounded-none border-r border-white/40 z-40 bg-white/30 backdrop-blur-xl">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-neutral-900">DestiFC</h1>
            <span className="text-xs text-neutral-500 font-medium tracking-wide uppercase">Admin Portal</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white/80 text-blue-600 shadow-sm shadow-black/5 font-semibold'
                    : 'text-neutral-600 hover:bg-white/40 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-neutral-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-black/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-500/10 rounded-2xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Lock / Logout
        </button>
      </div>
    </aside>
  );
}
