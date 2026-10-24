import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Edit2,
  Phone,
  Mail,
  AlertCircle,
  X,
  ChefHat,
  Receipt,
  PackageCheck,
  UserCheck,
} from 'lucide-react';
import { userService } from '../services/users';
import type { StaffUser, StaffRole, StaffSummary, CreateStaffPayload, UpdateStaffPayload } from '../types/user';

const ROLE_CONFIG: Record<
  StaffRole,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  owner: {
    label: 'Owner / Admin',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: Shield,
  },
  manager: {
    label: 'Branch Manager',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: UserCheck,
  },
  cashier: {
    label: 'Counter Cashier',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: Receipt,
  },
  kitchen: {
    label: 'Kitchen Master',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    icon: ChefHat,
  },
  stock_manager: {
    label: 'Stock Manager',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    icon: PackageCheck,
  },
};

export const UsersPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [summary, setSummary] = useState<StaffSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [revealedPins, setRevealedPins] = useState<Record<number, boolean>>({});

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [resetPinUser, setResetPinUser] = useState<StaffUser | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateStaffPayload>({
    name: '',
    email: '',
    role: 'cashier',
    phone: '',
    pin_code: '',
    password: '',
  });
  const [newPin, setNewPin] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      const res = await userService.getUsers();
      setStaff(res.staff);
      setSummary(res.summary);
    } catch (err: unknown) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await userService.getUsers();
        if (isMounted) {
          setStaff(res.staff);
          setSummary(res.summary);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Failed to load staff list:', err);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = () => {
    setLoading(true);
    loadStaff();
  };

  const togglePinReveal = (id: number) => {
    setRevealedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredStaff = useMemo(() => {
    return staff.filter((u) => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm)) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [staff, roleFilter, searchTerm]);

  const handleToggleStatus = async (user: StaffUser) => {
    try {
      await userService.toggleActive(user.id);
      loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      alert(msg);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      role: 'cashier',
      phone: '',
      pin_code: Math.floor(1000 + Math.random() * 9000).toString(),
      password: '',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      pin_code: user.pin_code,
      password: '',
    });
    setFormError(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.pin_code.trim()) {
      setFormError('Please fill in Name, Email and 4-digit PIN.');
      return;
    }

    if (formData.pin_code.length < 4 || formData.pin_code.length > 6) {
      setFormError('PIN code must be between 4 and 6 digits.');
      return;
    }

    try {
      setSaving(true);
      if (editingUser) {
        const payload: UpdateStaffPayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          pin_code: formData.pin_code,
        };
        if (formData.password?.trim()) {
          payload.password = formData.password;
        }
        await userService.updateUser(editingUser.id, payload);
        setEditingUser(null);
      } else {
        await userService.createUser(formData);
        setIsAddModalOpen(false);
      }
      loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving staff member';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinUser) return;
    if (newPin.length < 4 || newPin.length > 6) {
      alert('PIN must be 4 to 6 numeric digits');
      return;
    }

    try {
      setSaving(true);
      await userService.updateUser(resetPinUser.id, { pin_code: newPin });
      setResetPinUser(null);
      setNewPin('');
      loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating PIN';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Staff & Quick PIN Management
              </h1>
              <p className="text-sm text-zinc-400">
                Manage roles, POS login credentials, and fast 4-digit terminal PINs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition shadow-lg shadow-amber-500/10"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Total Staff
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {summary?.total_staff ?? staff.length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Configured team members</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Active Access
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {summary?.active_staff ?? staff.filter((s) => s.is_active).length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Can log in to terminals</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Cashiers
            </span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2">
            {summary?.cashier_count ?? staff.filter((s) => s.role === 'cashier').length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Front desk POS operators</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Kitchen Masters
            </span>
            <ChefHat className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400 mt-2">
            {summary?.kitchen_count ?? staff.filter((s) => s.role === 'kitchen').length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">KDS display operators</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search staff by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'owner', 'manager', 'cashier', 'kitchen', 'stock_manager'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              {role === 'all' ? 'All Roles' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/70 border-b border-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                <th className="py-3.5 px-4 font-semibold">Role</th>
                <th className="py-3.5 px-4 font-semibold">Contact</th>
                <th className="py-3.5 px-4 font-semibold">Terminal PIN</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-zinc-600 opacity-60" />
                    <p className="text-base font-medium text-zinc-400">No staff members found</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {searchTerm || roleFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Click "Add Staff Member" to configure your team'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((u) => {
                  const roleConfig = ROLE_CONFIG[u.role] || ROLE_CONFIG.cashier;
                  const RoleIcon = roleConfig.icon;
                  const isPinRevealed = !!revealedPins[u.id];

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-800/30 transition group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-amber-400 text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-amber-400 transition">
                              {u.name}
                            </div>
                            <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-zinc-600" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-300 font-bold tracking-widest">
                            {isPinRevealed ? u.pin_code : '••••'}
                          </span>
                          <button
                            onClick={() => togglePinReveal(u.id)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
                            title={isPinRevealed ? 'Hide PIN' : 'Show PIN'}
                          >
                            {isPinRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setResetPinUser(u);
                              setNewPin(Math.floor(1000 + Math.random() * 9000).toString());
                            }}
                            className="text-[11px] text-amber-500/80 hover:text-amber-400 hover:underline ml-1"
                          >
                            Reset
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/60 hover:bg-zinc-700'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-zinc-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit Staff Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingUser ? `Edit Staff: ${editingUser.name}` : 'Register New Staff'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ruwan Silva"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Email Address <span className="text-amber-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. ruwan@oonjal.lk"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as StaffRole })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="cashier">Counter Cashier</option>
                    <option value="kitchen">Kitchen Master</option>
                    <option value="manager">Branch Manager</option>
                    <option value="stock_manager">Stock Manager</option>
                    <option value="owner">Owner / Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Terminal PIN (4 Digits) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={formData.pin_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pin_code: e.target.value.replace(/\D/g, ''),
                        })
                      }
                      placeholder="e.g. 1234"
                      className="w-full pl-8 pr-3 py-2.5 font-mono text-amber-300 font-bold tracking-widest bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-amber-500/50"
                    />
                    <Key className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Account Password'}
                </label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : 'Default: password123'}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingUser ? 'Update Staff' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Reset PIN Modal */}
      {resetPinUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Reset PIN for {resetPinUser.name}
                </h3>
              </div>
              <button
                onClick={() => setResetPinUser(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPinSubmit} className="p-5 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enter a new 4 to 6 digit numerical PIN for quick terminal logins:
              </p>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center py-3 font-mono text-2xl tracking-[0.5em] text-amber-400 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPin(Math.floor(1000 + Math.random() * 9000).toString())}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-xl font-medium transition"
                >
                  Generate Random
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setResetPinUser(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || newPin.length < 4}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save New PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
