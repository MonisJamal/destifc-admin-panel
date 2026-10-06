'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Megaphone,
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
  Search,
  Moon,
  Sun,
  Swords,
  Radio,
  HeartHandshake,
  ShoppingBag
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
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

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
        { href: '/hosting', label: 'Hosting & Server Control', icon: Server, perm: 'hosting' },
        { href: '/diagnostics', label: 'Command Health & Ping', icon: Activity, perm: 'diagnostics' },
        { href: '/bot-config', label: 'Bot Status & Maint.', icon: Bot, perm: 'bot-config' },
        { href: '/drops', label: 'Loot Drops & Rains', icon: Radio, perm: 'economy-config' },
        { href: '/black-market', label: 'Black Market', icon: ShoppingBag, perm: 'economy-config' },
        { href: '/arcade', label: 'Arcade & Minigames', icon: Swords, perm: 'gameplay-config' },
        { href: '/prices', label: 'Price Setter', icon: Coins, perm: 'prices' },
        { href: '/luck', label: 'Drop Rates & Luck', icon: Percent, perm: 'luck' },
        { href: '/signature-box', label: 'Signature Box', icon: Gift, perm: 'signature-box' },
        { href: '/economy-config', label: 'Economy & Rewards', icon: Briefcase, perm: 'economy-config' },
        { href: '/gameplay-config', label: 'Gameplay & Matches', icon: Gamepad2, perm: 'gameplay-config' },
        { href: '/season-sbc', label: 'Season Pass & SBCs', icon: Award, perm: 'season-sbc' },
        { href: '/compensation', label: 'Compensation Events', icon: HeartHandshake, perm: 'admin-commands' },
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
        { href: '/announcements', label: 'Announcements (DM)', icon: Megaphone, perm: 'announcements' },
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

  // Universal Search Index covering every setting, feature, command, and keyword
  const searchIndex = [
    // Arcade & Games
    { label: 'Pack Battles (/pack_battle)', route: '/arcade', section: 'Arcade' },
    { label: 'Voucher Wager Limits (Up to 50)', route: '/arcade', section: 'Arcade' },
    { label: 'Penalty Shootout (/shootout)', route: '/arcade', section: 'Arcade' },
    { label: 'Shootout Rewards & Dives', route: '/arcade', section: 'Arcade' },
    { label: 'Lucky Wheel (/spin)', route: '/arcade', section: 'Arcade' },
    { label: 'Spin Wheel Cooldown & Jackpots', route: '/arcade', section: 'Arcade' },
    { label: 'Draft Battles ELO Settings', route: '/arcade', section: 'Arcade' },
    // Loot Drops & Rains
    { label: 'Loot Drops & Voucher Rains', route: '/drops', section: 'Loot Drops' },
    { label: 'Discord Drop Channel ID', route: '/drops', section: 'Loot Drops' },
    { label: 'Crate Drop Interval & Timers', route: '/drops', section: 'Loot Drops' },
    { label: 'Vouchers per Crate Drop', route: '/drops', section: 'Loot Drops' },
    { label: 'Fast Claim Limits for Drops', route: '/drops', section: 'Loot Drops' },
    // Economy & Streak
    { label: 'Daily 7-Day Streak Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Draft Voucher Earning Limits', route: '/economy-config', section: 'Economy' },
    { label: 'Starting Coins & Vouchers', route: '/economy-config', section: 'Economy' },
    { label: 'Work & Match Rewards', route: '/economy-config', section: 'Economy' },
    { label: 'Market Tax & Trade Tax', route: '/economy-config', section: 'Economy' },
    // Compensation
    { label: 'Active Compensation Event', route: '/compensation', section: 'Compensation' },
    { label: 'Global Free Rewards /compensation', route: '/compensation', section: 'Compensation' },
    { label: 'Event ID & Expiry Dates', route: '/compensation', section: 'Compensation' },
    // Hosting & Server Control
    { label: 'Pterodactyl Node Connection', route: '/hosting', section: 'Hosting' },
    { label: 'Live Server Console Logs', route: '/hosting', section: 'Hosting' },
    { label: 'Reboot & Start Bot Process', route: '/hosting', section: 'Hosting' },
    { label: 'Hot Reload Cogs Without Reboot', route: '/hosting', section: 'Hosting' },
    { label: 'Flush RAM Caches', route: '/hosting', section: 'Hosting' },
    // Prices
    { label: 'OVR Price Floors & Minimums', route: '/prices', section: 'Prices' },
    { label: 'Quicksell Value Percentage', route: '/prices', section: 'Prices' },
    { label: 'Max Market Listing Ceiling', route: '/prices', section: 'Prices' },
    // Bot Config
    { label: 'Discord Presence & Playing Status', route: '/bot-config', section: 'Bot Config' },
    { label: 'Maintenance Mode Toggle', route: '/bot-config', section: 'Bot Config' },
    { label: 'Per-Command Enable / Disable', route: '/bot-config', section: 'Bot Config' },
    // Signatures
    { label: 'Signature Box Card & Rewards', route: '/signature-box', section: 'Signatures' },
    { label: 'Signature Draw Costs & Keys', route: '/signature-box', section: 'Signatures' },
    // Luck & Drop Rates
    { label: 'Draft Pack Drop Rates (Pool A/B/C)', route: '/luck', section: 'Drop Rates' },
    { label: 'Walkout Shares (122 / 121 / 120)', route: '/luck', section: 'Drop Rates' },
    { label: 'Pity System Thresholds', route: '/luck', section: 'Drop Rates' },
    { label: 'Global Luck Multiplier', route: '/luck', section: 'Drop Rates' },
    // Gameplay
    { label: 'Match Simulation Difficulty', route: '/gameplay-config', section: 'Gameplay' },
    { label: 'H2H Bot Matches', route: '/gameplay-config', section: 'Gameplay' },
    // SBCs & Season Pass
    { label: 'Active SBC Challenges & Packs', route: '/season-sbc', section: 'Season Pass' },
    { label: 'Season Pass XP Tiers & Rewards', route: '/season-sbc', section: 'Season Pass' },
    // Cards
    { label: 'Create New Custom Card', route: '/custom-cards', section: 'Cards' },
    { label: 'Search 1,884 Official Cards', route: '/cards', section: 'Cards' },
    { label: 'Card Database Viewer', route: '/cards', section: 'Cards' },
    // Formations
    { label: '3D Stadium Pitch Coordinates', route: '/formations', section: 'Formations' },
    { label: 'Tactical Layout Editor', route: '/formations', section: 'Formations' },
    // Database
    { label: 'Live Database Tables & SQL', route: '/database', section: 'Database' },
    { label: 'Users List & Inventories', route: '/users', section: 'Users' },
    { label: 'Reset User Account / Progress', route: '/admin-commands', section: 'Admin' },
    // Admin Commands
    { label: 'Grant Coins & Vouchers', route: '/admin-commands', section: 'Admin' },
    { label: 'Wipe User Inventory', route: '/admin-commands', section: 'Admin' },
    { label: 'Spawn Player into Inventory', route: '/admin-commands', section: 'Admin' },
    // Announcements
    { label: 'Mass DM All Bot Users', route: '/announcements', section: 'Announcements' },
    // Leaks
    { label: 'Upcoming Draft Leaks & Datamines', route: '/leaks', section: 'Leaks' },
  ];

  const searchResults = searchQuery.length > 1 
    ? searchIndex.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.section.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-surface)] border-b border-[var(--border-glass)] backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-fuchsia-600/30">
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
          <div className="flex items-center justify-between mb-5 px-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-fuchsia-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-600/30 shrink-0">
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

          {/* Search Bar */}
          <div className="px-2 mb-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 opacity-70" />
              <input 
                type="text" 
                placeholder="Search all settings & games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--border-glass)] rounded-xl text-xs focus:outline-none focus:border-pink-500 text-[var(--text-main)] transition-all placeholder:text-[var(--text-muted)]"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-80 bg-[var(--card-bg)] border border-[var(--border-glass)] rounded-2xl shadow-2xl overflow-y-auto z-[100] backdrop-blur-2xl">
                  {searchResults.map((res, i) => (
                    <Link 
                      key={i} 
                      href={res.route}
                      onClick={() => { setSearchQuery(''); setMobileOpen(false); }}
                      className="block px-4 py-2.5 hover:bg-pink-500/10 border-b border-[var(--border-glass)] last:border-0 transition-colors"
                    >
                      <div className="text-xs font-bold text-[var(--text-main)]">{res.label}</div>
                      <div className="text-[9px] uppercase tracking-wider text-pink-400 font-semibold">{res.section}</div>
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
                <div className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[var(--text-main)] leading-none truncate">@{user.username}</p>
                  <span className="text-[9px] text-pink-400 uppercase font-semibold">{user.role}</span>
                </div>
              </div>
              
              <button
                onClick={toggleTheme}
                title="Toggle Theme"
                className="p-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-glass)] text-[var(--text-main)] hover:bg-pink-500/10 transition-colors"
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
                          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-500/30 shadow-sm shadow-pink-500/10 font-bold'
                              : 'text-[var(--text-main)] opacity-75 hover:bg-pink-500/10 hover:text-[var(--text-main)] hover:opacity-100'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-400' : 'opacity-60'}`} />
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
        <div className="pt-3 border-t border-[var(--border-glass)] shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2 text-xs font-semibold text-pink-400 hover:bg-pink-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
