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
  UserCheck,
  Search,
  Moon,
  Sun
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme === 'pink-light' ? 'pink-light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'pink-light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };


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

  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) && hasPerm(item.perm)
    )
  })).filter(section => section.items.length > 0);


  const searchIndex = [
    // Economy
    { label: 'Starting Coins', route: '/economy-config', section: 'Economy' },
    { label: 'Daily Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Match Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Draft Vouchers', route: '/economy-config', section: 'Economy' },
    { label: 'Starter Pack Claim', route: '/economy-config', section: 'Economy' },
    // Prices
    { label: 'OVR Price Floors', route: '/prices', section: 'Prices' },
    { label: 'Quicksell Values', route: '/prices', section: 'Prices' },
    { label: 'Market Tax', route: '/prices', section: 'Prices' },
    // Bot Config
    { label: 'Bot Status', route: '/bot-config', section: 'Bot Config' },
    { label: 'Maintenance Mode', route: '/bot-config', section: 'Bot Config' },
    { label: 'Discord Presence', route: '/bot-config', section: 'Bot Config' },
    // Signatures
    { label: 'Signature Box Limit', route: '/signature-box', section: 'Signatures' },
    { label: 'Signature Probabilities', route: '/signature-box', section: 'Signatures' },
    // Luck
    { label: 'Drop Rates', route: '/luck', section: 'Luck' },
    { label: 'Pack Animation Luck', route: '/luck', section: 'Luck' },
    { label: 'Walkout Rates (120+)', route: '/luck', section: 'Luck' },
    { label: 'Pity System', route: '/luck', section: 'Luck' },
    // Gameplay
    { label: 'Match Engine Difficulty', route: '/gameplay-config', section: 'Gameplay' },
    { label: 'Energy Recharge', route: '/gameplay-config', section: 'Gameplay' },
    { label: 'Match Duration', route: '/gameplay-config', section: 'Gameplay' },
    // SBCs & Season
    { label: 'SBC Requirements', route: '/season-sbc', section: 'SBCs' },
    { label: 'Season Pass XP', route: '/season-sbc', section: 'Season' },
    { label: 'Season Rewards', route: '/season-sbc', section: 'Season' },
    // Cards
    { label: 'Add Custom Card', route: '/custom-cards', section: 'Custom Cards' },
    { label: 'Edit Custom Cards', route: '/custom-cards', section: 'Custom Cards' },
    { label: 'View Official Cards', route: '/cards', section: 'Cards' },
    // Formations
    { label: 'Formation Adjuster', route: '/formations', section: 'Formations' },
    { label: 'Lineup Coordinates', route: '/formations', section: 'Formations' },
    { label: 'Tactical Layouts', route: '/formations', section: 'Formations' },
    // Database
    { label: 'View Database', route: '/database', section: 'Database' },
    { label: 'SQL Queries', route: '/database', section: 'Database' },
    { label: 'Users List', route: '/users', section: 'Users' },
    { label: 'User Inventories', route: '/users', section: 'Users' },
    { label: 'User Balances', route: '/users', section: 'Users' },
    // System
    { label: 'Server Diagnostics', route: '/diagnostics', section: 'System' },
    { label: 'Server Ping', route: '/diagnostics', section: 'System' },
    { label: 'Pterodactyl Hosting', route: '/hosting', section: 'System' },
    { label: 'Server Control', route: '/hosting', section: 'System' },
    // Admin
    { label: 'Give Coins / Vouchers', route: '/admin-commands', section: 'Admin' },
    { label: 'Make Exchange Exclusive', route: '/admin-commands', section: 'Admin' },
    { label: 'Give Players', route: '/admin-commands', section: 'Admin' },
    // Leaks
    { label: 'EA Leaks', route: '/leaks', section: 'Leaks' },
    { label: 'Upcoming Drafts', route: '/leaks', section: 'Leaks' },
    { label: 'RenderZ Datamines', route: '/leaks', section: 'Leaks' },
  ];

  const searchResults = searchQuery.length > 1 
    ? searchIndex.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-surface)] border-b border-[var(--border-glass)] backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 flex items-center justify-center text-[var(--text-main)] shadow-md shadow-fuchsia-600/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-[var(--text-main)]">DestiFC</h1>
            <span className="text-[9px] text-pink-400 font-semibold uppercase">Admin Suite</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-glass)] text-[var(--text-main)] opacity-90 hover:text-[var(--text-main)]"
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
      <aside className={`w-72 fixed top-0 left-0 h-screen p-5 flex flex-col justify-between glass-card rounded-none border-r border-[var(--border-glass)] z-50 bg-[var(--bg-surface)] lg:bg-[var(--bg-surface)] backdrop-blur-2xl overflow-hidden transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 px-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 flex items-center justify-center text-[var(--text-main)] shadow-lg shadow-fuchsia-600/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-none tracking-tight text-[var(--text-main)]">DestiFC</h1>
                <span className="text-[10px] text-pink-400 font-semibold tracking-wider uppercase">Admin Control Suite</span>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden text-[var(--text-main)] opacity-70 hover:text-[var(--text-main)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-2 mb-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-purple)] opacity-50" />
              <input 
                type="text" 
                placeholder="Search settings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--border-glass)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent-fuchsia)] text-[var(--text-main)] transition-all placeholder:text-[var(--text-main)] placeholder:opacity-50"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border-glass)] rounded-xl shadow-xl overflow-hidden z-[100] backdrop-blur-xl">
                  {searchResults.map((res, i) => (
                    <Link 
                      key={i} 
                      href={res.route}
                      onClick={() => { setSearchQuery(''); setMobileOpen(false); }}
                      className="block px-4 py-2.5 hover:bg-[var(--sidebar-hover)] border-b border-[var(--border-glass)] last:border-0"
                    >
                      <div className="text-xs font-bold text-[var(--text-main)]">{res.label}</div>
                      <div className="text-[9px] uppercase tracking-wider text-[var(--accent-fuchsia)]">{res.section}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Profile & Theme Pill */}
          {user && (
            <div className="mb-4 px-3 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-glass)] flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-pink)] text-[var(--text-main)] flex items-center justify-center text-[10px] font-black shrink-0">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[var(--text-main)] leading-none truncate">@{user.username}</p>
                  <span className="text-[9px] text-[var(--accent-fuchsia)] uppercase font-semibold">{user.role}</span>
                </div>
              </div>
              
              <button
                onClick={toggleTheme}
                title="Toggle Theme"
                className="p-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-glass)] text-[var(--text-main)] hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 space-y-6 overflow-y-auto pr-1 pb-4 scrollbar-thin">
            {filteredSections.map((section) => {
              const visibleItems = section.items;
              if (visibleItems.length === 0) return null;

            
  const searchIndex = [
    // Economy
    { label: 'Starting Coins', route: '/economy-config', section: 'Economy' },
    { label: 'Daily Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Match Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Draft Vouchers', route: '/economy-config', section: 'Economy' },
    { label: 'Starter Pack Claim', route: '/economy-config', section: 'Economy' },
    // Prices
    { label: 'OVR Price Floors', route: '/prices', section: 'Prices' },
    { label: 'Quicksell Values', route: '/prices', section: 'Prices' },
    { label: 'Market Tax', route: '/prices', section: 'Prices' },
    // Bot Config
    { label: 'Bot Status', route: '/bot-config', section: 'Bot Config' },
    { label: 'Maintenance Mode', route: '/bot-config', section: 'Bot Config' },
    { label: 'Discord Presence', route: '/bot-config', section: 'Bot Config' },
    // Signatures
    { label: 'Signature Box Limit', route: '/signature-box', section: 'Signatures' },
    { label: 'Signature Probabilities', route: '/signature-box', section: 'Signatures' },
    // Luck
    { label: 'Drop Rates', route: '/luck', section: 'Luck' },
    { label: 'Pack Animation Luck', route: '/luck', section: 'Luck' },
    { label: 'Walkout Rates (120+)', route: '/luck', section: 'Luck' },
    { label: 'Pity System', route: '/luck', section: 'Luck' },
    // Gameplay
    { label: 'Match Engine Difficulty', route: '/gameplay-config', section: 'Gameplay' },
    { label: 'Energy Recharge', route: '/gameplay-config', section: 'Gameplay' },
    { label: 'Match Duration', route: '/gameplay-config', section: 'Gameplay' },
    // SBCs & Season
    { label: 'SBC Requirements', route: '/season-sbc', section: 'SBCs' },
    { label: 'Season Pass XP', route: '/season-sbc', section: 'Season' },
    { label: 'Season Rewards', route: '/season-sbc', section: 'Season' },
    // Cards
    { label: 'Add Custom Card', route: '/custom-cards', section: 'Custom Cards' },
    { label: 'Edit Custom Cards', route: '/custom-cards', section: 'Custom Cards' },
    { label: 'View Official Cards', route: '/cards', section: 'Cards' },
    // Formations
    { label: 'Formation Adjuster', route: '/formations', section: 'Formations' },
    { label: 'Lineup Coordinates', route: '/formations', section: 'Formations' },
    { label: 'Tactical Layouts', route: '/formations', section: 'Formations' },
    // Database
    { label: 'View Database', route: '/database', section: 'Database' },
    { label: 'SQL Queries', route: '/database', section: 'Database' },
    { label: 'Users List', route: '/users', section: 'Users' },
    { label: 'User Inventories', route: '/users', section: 'Users' },
    { label: 'User Balances', route: '/users', section: 'Users' },
    // System
    { label: 'Server Diagnostics', route: '/diagnostics', section: 'System' },
    { label: 'Server Ping', route: '/diagnostics', section: 'System' },
    { label: 'Pterodactyl Hosting', route: '/hosting', section: 'System' },
    { label: 'Server Control', route: '/hosting', section: 'System' },
    // Admin
    { label: 'Give Coins / Vouchers', route: '/admin-commands', section: 'Admin' },
    { label: 'Make Exchange Exclusive', route: '/admin-commands', section: 'Admin' },
    { label: 'Give Players', route: '/admin-commands', section: 'Admin' },
    // Leaks
    { label: 'EA Leaks', route: '/leaks', section: 'Leaks' },
    { label: 'Upcoming Drafts', route: '/leaks', section: 'Leaks' },
    { label: 'RenderZ Datamines', route: '/leaks', section: 'Leaks' },
  ];

  const searchResults = searchQuery.length > 1 
    ? searchIndex.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
                <div key={section.title}>
                  <h2 className="px-3 text-[10px] font-bold tracking-wider text-purple-300/60 uppercase mb-2">
                    {section.title}
                  </h2>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                    
  const searchIndex = [
    // Economy
    { label: 'Starting Coins', route: '/economy-config', section: 'Economy' },
    { label: 'Daily Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Match Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Draft Vouchers', route: '/economy-config', section: 'Economy' },
    { label: 'Starter Pack Claim', route: '/economy-config', section: 'Economy' },
    // Prices
    { label: 'OVR Price Floors', route: '/prices', section: 'Prices' },
    { label: 'Quicksell Values', route: '/prices', section: 'Prices' },
    { label: 'Market Tax', route: '/prices', section: 'Prices' },
    // Bot Config
    { label: 'Bot Status', route: '/bot-config', section: 'Bot Config' },
    { label: 'Maintenance Mode', route: '/bot-config', section: 'Bot Config' },
    { label: 'Discord Presence', route: '/bot-config', section: 'Bot Config' },
    // Signatures
    { label: 'Signature Box Limit', route: '/signature-box', section: 'Signatures' },
    { label: 'Signature Probabilities', route: '/signature-box', section: 'Signatures' },
    // Luck
    { label: 'Drop Rates', route: '/luck', section: 'Luck' },
    { label: 'Pack Animation Luck', route: '/luck', section: 'Luck' },
    { label: 'Walkout Rates (120+)', route: '/luck', section: 'Luck' },
    { label: 'Pity System', route: '/luck', section: 'Luck' },
    // Gameplay
    { label: 'Match Engine Difficulty', route: '/gameplay-config', section: 'Gameplay' },
    { label: 'Energy Recharge', route: '/gameplay-config', section: 'Gameplay' },
    { label: 'Match Duration', route: '/gameplay-config', section: 'Gameplay' },
    // SBCs & Season
    { label: 'SBC Requirements', route: '/season-sbc', section: 'SBCs' },
    { label: 'Season Pass XP', route: '/season-sbc', section: 'Season' },
    { label: 'Season Rewards', route: '/season-sbc', section: 'Season' },
    // Cards
    { label: 'Add Custom Card', route: '/custom-cards', section: 'Custom Cards' },
    { label: 'Edit Custom Cards', route: '/custom-cards', section: 'Custom Cards' },
    { label: 'View Official Cards', route: '/cards', section: 'Cards' },
    // Formations
    { label: 'Formation Adjuster', route: '/formations', section: 'Formations' },
    { label: 'Lineup Coordinates', route: '/formations', section: 'Formations' },
    { label: 'Tactical Layouts', route: '/formations', section: 'Formations' },
    // Database
    { label: 'View Database', route: '/database', section: 'Database' },
    { label: 'SQL Queries', route: '/database', section: 'Database' },
    { label: 'Users List', route: '/users', section: 'Users' },
    { label: 'User Inventories', route: '/users', section: 'Users' },
    { label: 'User Balances', route: '/users', section: 'Users' },
    // System
    { label: 'Server Diagnostics', route: '/diagnostics', section: 'System' },
    { label: 'Server Ping', route: '/diagnostics', section: 'System' },
    { label: 'Pterodactyl Hosting', route: '/hosting', section: 'System' },
    { label: 'Server Control', route: '/hosting', section: 'System' },
    // Admin
    { label: 'Give Coins / Vouchers', route: '/admin-commands', section: 'Admin' },
    { label: 'Make Exchange Exclusive', route: '/admin-commands', section: 'Admin' },
    { label: 'Give Players', route: '/admin-commands', section: 'Admin' },
    // Leaks
    { label: 'EA Leaks', route: '/leaks', section: 'Leaks' },
    { label: 'Upcoming Drafts', route: '/leaks', section: 'Leaks' },
    { label: 'RenderZ Datamines', route: '/leaks', section: 'Leaks' },
  ];

  const searchResults = searchQuery.length > 1 
    ? searchIndex.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-500/30 shadow-sm shadow-pink-500/10 font-bold'
                              : 'text-[var(--text-main)] opacity-70 hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-main)] hover:opacity-100'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-400' : 'text-[var(--text-main)] opacity-50'}`} />
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
        <div className="pt-4 border-t border-[var(--border-glass)] shrink-0">
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

