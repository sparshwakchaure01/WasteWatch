import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Users, UserPlus, ShieldCheck, Building2, Search, CheckCircle2, User as UserIcon } from 'lucide-react';

export const ManageUsersPage: React.FC = () => {
  const { role: currentRole } = useAuth();
  const { usersList, addUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [userRole, setUserRole] = useState<UserRole>('Local Body');
  const [department, setDepartment] = useState('Sanitation & Waste Management');
  const [jurisdictionZone, setJurisdictionZone] = useState('Sangamner Central Zone');

  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    addUser({
      fullName,
      phone,
      role: userRole,
      department: userRole === 'Local Body' ? department : undefined,
      jurisdictionZone: userRole === 'Local Body' ? jurisdictionZone : undefined,
    });

    setShowAddModal(false);
    setFullName('');
    setPhone('+91');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-[#22223B]">
                User Management Directory
              </h2>
              <span className="text-xs font-bold bg-[#22223B] text-white px-2.5 py-0.5 rounded-full">
                Admin Privilege
              </span>
            </div>
            <p className="text-xs text-[#4A4E69]">
              Register municipal Local Body officers, manage user access levels, and assign jurisdiction zones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, role..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs text-[#22223B] focus:outline-none focus:ring-2 focus:ring-[#22223B]"
              />
            </div>

            {currentRole === 'Administrator' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#22223B] hover:bg-[#333355] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Officer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table / Directory */}
      <div className="bg-white rounded-3xl border border-[#9A8C98]/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#22223B]">
            <thead className="bg-[#22223B] text-white text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Department / Zone</th>
                <th className="p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 font-bold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F2E9E4] text-[#22223B] flex items-center justify-center font-bold">
                      {u.fullName.charAt(0)}
                    </div>
                    <span>{u.fullName}</span>
                  </td>
                  <td className="p-4 font-mono">{u.phone}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'Administrator'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : u.role === 'Local Body'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {u.role === 'Administrator' && <ShieldCheck className="w-3 h-3" />}
                      {u.role === 'Local Body' && <Building2 className="w-3 h-3" />}
                      {u.role === 'Reporter' && <UserIcon className="w-3 h-3" />}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="p-4 text-stone-600">
                    {u.department ? `${u.department} (${u.jurisdictionZone || 'All'})` : 'Citizen Reporter'}
                  </td>
                  <td className="p-4 text-stone-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Municipal User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#9A8C98]/30 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading text-base font-bold text-[#22223B] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#22223B]" />
                <span>Register Municipal Local Body User</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#22223B] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Inspector Rajesh Patil"
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#22223B] mb-1">
                  Registered Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919890011223"
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#22223B] mb-1">
                  Role Assignment *
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                >
                  <option value="Local Body">Local Body (Municipal Officer)</option>
                  <option value="Reporter">Reporter (Citizen)</option>
                </select>
              </div>

              {userRole === 'Local Body' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#22223B] mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#22223B] mb-1">
                      Jurisdiction Zone
                    </label>
                    <input
                      type="text"
                      value={jurisdictionZone}
                      onChange={(e) => setJurisdictionZone(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-[#22223B] rounded-xl shadow hover:bg-[#333355]"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
