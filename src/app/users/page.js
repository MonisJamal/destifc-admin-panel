'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import LiquidButton from '@/components/LiquidButton';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Lock, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { id: 'all', label: '⭐ Full Superadmin (All Permissions)', category: 'Root' },
  // Bot & Hosting
  { id: 'dashboard', label: 'Dashboard & Global Analytics', href: '/', category: 'Bot & Hosting' },
  { id: 'hosting', label: 'Hosting & Server Control', href: '/hosting', category: 'Bot & Hosting' },
  { id: 'diagnostics', label: 'Command Health & Ping Suite', href: '/diagnostics', category: 'Bot & Hosting' },
  { id: 'bot-config', label: 'Bot Status & Maintenance', href: '/bot-config', category: 'Bot & Hosting' },
  // Events & Special Markets
  { id: 'drops', label: 'Loot Drops & Voucher Rains', href: '/drops', category: 'Events & Markets' },
  { id: 'black-market', label: 'Black Market & Flash Discounts', href: '/black-market', category: 'Events & Markets' },
  { id: 'exchange-exclusive', label: 'Exchange Exclusives Management', href: '/exchange-exclusive', category: 'Events & Markets' },
  { id: 'arcade', label: 'Arcade & Minigames Engine', href: '/arcade', category: 'Events & Markets' },
  { id: 'compensation', label: 'Compensation Events & Grants', href: '/compensation', category: 'Events & Markets' },
  // Economy & Progression
  { id: 'prices', label: 'Price Setter & Market Tax', href: '/prices', category: 'Economy & Gameplay' },
  { id: 'luck', label: 'Drop Rates & Luck Multipliers', href: '/luck', category: 'Economy & Gameplay' },
  { id: 'signature-box', label: 'Signature Box & Live Promos', href: '/signature-box', category: 'Economy & Gameplay' },
  { id: 'economy-config', label: 'Economy & Quest Rewards', href: '/economy-config', category: 'Economy & Gameplay' },
  { id: 'gameplay-config', label: 'Gameplay & Matches Settings', href: '/gameplay-config', category: 'Economy & Gameplay' },
  { id: 'season-sbc', label: 'Season Pass & Active SBCs', href: '/season-sbc', category: 'Economy & Gameplay' },
  // Cards & Database
  { id: 'leaks', label: 'Leaks & Promo Drafts', href: '/leaks', category: 'Cards & Database' },
  { id: 'cards', label: 'Card Database & Catalog', href: '/cards', category: 'Cards & Database' },
  { id: 'custom-cards', label: 'Custom Cards Designer', href: '/custom-cards', category: 'Cards & Database' },
  { id: 'formations', label: 'Formations 3D Geometry', href: '/formations', category: 'Cards & Database' },
  { id: 'admin-commands', label: 'Admin Commands & Currency Grants', href: '/admin-commands', category: 'Cards & Database' },
  { id: 'announcements', label: 'Announcements (Mass DMs)', href: '/announcements', category: 'Cards & Database' },
  { id: 'database', label: 'Cloud Tables & Direct SQL', href: '/database', category: 'Cards & Database' },
  // Administration
  { id: 'users', label: 'Team & Access Control (User RBAC)', href: '/users', category: 'Administration' },
];

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('moderator');
  const [selectedPermissions, setSelectedPermissions] = useState(['dashboard', 'diagnostics']);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setDisplayName('');
    setRole('moderator');
    setSelectedPermissions(['dashboard', 'diagnostics', 'prices', 'cards']);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(''); // leave blank to keep unchanged
    setDisplayName(user.display_name || '');
    setRole(user.role || 'moderator');
    setSelectedPermissions(user.permissions || ['dashboard']);
    setIsModalOpen(true);
  };

  const togglePermission = (permId) => {
    if (permId === 'all') {
      if (selectedPermissions.includes('all')) {
        setSelectedPermissions(['dashboard']);
      } else {
        setSelectedPermissions(['all']);
      }
      return;
    }

    let updated = selectedPermissions.filter(p => p !== 'all');
    if (updated.includes(permId)) {
      updated = updated.filter(p => p !== permId);
    } else {
      updated.push(permId);
    }
    if (updated.length === 0) updated = ['dashboard'];
    setSelectedPermissions(updated);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setSaving(true);
    try {
      const payload = {
        id: editingUser ? editingUser.id : undefined,
        username: username.trim(),
        password: password.trim() || undefined,
        display_name: displayName.trim() || username.trim(),
        role,
        permissions: selectedPermissions
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        setIsModalOpen(false);
        fetchUsers();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to save user.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.username === 'desti' || user.username === 'admin') {
      alert('Root superadmin accounts cannot be removed.');
      return;
    }
    if (!confirm(`Are you sure you want to delete admin account "${user.username}"?`)) return;

    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        fetchUsers();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to delete user.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex selection:bg-purple-500/30 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-72 ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-glass)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Granular RBAC & Access Control
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-[var(--border-glass)]">
                Multi-User Authentication
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Team & Access Control
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-main)] opacity-70 mt-1">
              Create custom login accounts with individual usernames, passwords (e.g. <code className="text-pink-300 bg-[var(--input-bg)] px-1 py-0.5 rounded">desti</code> / <code className="text-purple-300 bg-[var(--input-bg)] px-1 py-0.5 rounded">destisquad</code>), and configure exactly which pages each user can view.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LiquidButton onClick={openCreateModal}>
              <UserPlus className="w-4 h-4" />
              Add New Admin User
            </LiquidButton>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <p className="text-xs sm:text-sm font-bold">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-[var(--text-main)] opacity-50 hover:text-[var(--text-main)] text-xs">✕</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-[var(--card-bg)]/40 border border-[var(--border-glass)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-bold text-[var(--text-main)] opacity-90">{users.length} Registered Admin Accounts</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--text-main)] opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] opacity-90 placeholder-neutral-500 focus:outline-none focus:border-fuchsia-500"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-3xl bg-[var(--card-bg)]/50 border border-[var(--border-glass)] overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-main)] opacity-90">
              <thead className="bg-[var(--input-bg)]/80 border-b border-[var(--border-glass)] text-[10px] uppercase font-bold tracking-wider text-[var(--text-main)] opacity-70">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Admin User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Allowed Pages & Permissions</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--text-main)] opacity-50">
                      <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-fuchsia-400" />
                      Loading team access registry...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--text-main)] opacity-50">
                      No admin users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSuper = user.role === 'superadmin' || user.permissions.includes('all');
                    return (
                      <tr key={user.id} className="hover:bg-[var(--card-bg)]/[0.02] transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 flex items-center justify-center font-black text-xs shrink-0">
                              {user.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                                <span>{user.display_name || user.username}</span>
                                {user.username === 'desti' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/40">OWNER</span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-[var(--text-main)] opacity-50">@{user.username}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            isSuper 
                              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-[var(--border-glass)]'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-xs sm:max-w-md">
                          {isSuper ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              Full Access (All 23 Sections Unlocked)
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {(user.permissions || []).map((perm) => (
                                <span key={perm} className="px-2 py-0.5 rounded-md bg-[var(--input-bg)] text-[var(--text-main)] opacity-90 border border-[var(--border-glass)] text-[10px] font-mono">
                                  {perm}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 text-[11px] text-[var(--text-main)] opacity-50">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--card-bg)] text-[var(--text-main)] opacity-90 hover:text-[var(--text-main)] border border-purple-900/40 transition-all"
                              title="Edit user credentials & permissions"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {user.username !== 'desti' && user.username !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded-lg bg-[var(--input-bg)] hover:bg-red-950/50 text-[var(--text-main)] opacity-70 hover:text-red-400 border border-purple-900/40 hover:border-red-500/40 transition-all"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-3xl bg-[var(--card-bg)] border border-purple-900/50 p-6 sm:p-8 shadow-2xl shadow-purple-950/60 my-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border-glass)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-[var(--text-main)] flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-main)]">
                    {editingUser ? `Edit Credentials: @${editingUser.username}` : 'Add New Admin Account'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--input-bg)] text-[var(--text-main)] opacity-70 hover:text-[var(--text-main)] flex items-center justify-center border border-purple-900/40"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-70">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. desti or mod_alex"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] focus:outline-none focus:border-fuchsia-500 font-mono"
                      required
                    />
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-70">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Desti Admin"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-70">
                        {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={editingUser ? '••••••••' : 'e.g. destisquad'}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] focus:outline-none focus:border-fuchsia-500 font-mono"
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-main)] opacity-70 hover:text-[var(--text-main)]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-70">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setRole(newRole);
                        if (newRole === 'superadmin') {
                          setSelectedPermissions(['all']);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-purple-900/40 text-xs text-[var(--text-main)] focus:outline-none focus:border-fuchsia-500"
                    >
                      <option value="superadmin">Super Admin (All Sections Unlocked)</option>
                      <option value="moderator">Moderator (Custom Permissions)</option>
                      <option value="viewer">Viewer (Read-Only Diagnostics)</option>
                    </select>
                  </div>
                </div>

                {/* Granular Permission Matrix */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] opacity-90">
                      Accessible Pages & Permissions Matrix
                    </label>
                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(['all'])}
                        className="text-pink-400 hover:underline font-bold"
                      >
                        Select All
                      </button>
                      <span className="text-[var(--text-main)] opacity-70">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(['dashboard', 'diagnostics'])}
                        className="text-[var(--text-main)] opacity-70 hover:underline"
                      >
                        Minimal Only
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 rounded-2xl bg-[var(--input-bg)]/80 border border-[var(--border-glass)] max-h-64 overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = selectedPermissions.includes('all') || selectedPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-pink-500/10 border border-pink-500/30 text-pink-200' 
                              : 'bg-[var(--card-bg)]/50 hover:bg-[var(--card-bg)] border border-transparent text-[var(--text-main)] opacity-70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.id)}
                            className="mt-0.5 rounded border-purple-900 text-pink-500 focus:ring-pink-500 bg-[var(--input-bg)]"
                          />
                          <div className="text-[11px] leading-tight">
                            <span className="font-bold block">{perm.label}</span>
                            <span className="text-[9px] text-[var(--text-main)] opacity-50">{perm.category}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--input-bg)] text-[var(--text-main)] opacity-70 hover:text-[var(--text-main)] border border-purple-900/40 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <LiquidButton type="submit" disabled={saving} loading={saving}>
                    <Check className="w-4 h-4" />
                    <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                  </LiquidButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
