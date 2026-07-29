import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ComplaintStatus, WasteCategory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { Search, Filter, Calendar, MapPin, ArrowRight, ClipboardList } from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const { role, currentUser } = useAuth();
  const { complaints, viewComplaintDetails } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // If role is Reporter, default to showing their own. If Local Body / Admin, show all complaints.
  const relevantComplaints = role === 'Reporter'
    ? complaints.filter((c) => c.reporterId === currentUser?.uid || c.reporterPhone === currentUser?.phone)
    : complaints;

  const filteredComplaints = relevantComplaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categoriesList: WasteCategory[] = [
    'Plastic Waste',
    'Household Waste',
    'Construction Debris',
    'Garden Waste',
    'Electronic Waste',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Search Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#22223B]">
              {role === 'Reporter' ? 'My Reported Complaints' : 'Municipal Complaints Registry'}
            </h2>
            <p className="text-xs text-[#4A4E69]">
              {filteredComplaints.length} complaint record{filteredComplaints.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, location, details..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs text-[#22223B] focus:outline-none focus:ring-2 focus:ring-[#22223B]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1 text-xs font-semibold text-[#4A4E69] mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </div>

          {['All', 'Pending Approval', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-[#22223B] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}

          <div className="h-4 w-px bg-stone-200 mx-2 hidden sm:block" />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 bg-stone-100 border border-stone-300 rounded-full text-xs font-semibold text-[#22223B] focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#9A8C98]/20 text-center space-y-3">
          <ClipboardList className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-[#22223B] text-sm">No complaints found</h3>
          <p className="text-xs text-[#4A4E69]">Try clearing search filters or submitting a new report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              onClick={() => viewComplaintDetails(c.id)}
              className="bg-white rounded-3xl border border-[#9A8C98]/20 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="relative h-44 bg-stone-900">
                  <img
                    src={c.photoUrl}
                    alt={c.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-white font-bold">
                    #{c.id}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <CategoryBadge category={c.category} />
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#22223B] line-clamp-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{c.locationName}</span>
                  </h3>

                  <p className="text-xs text-[#4A4E69] line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#22223B] group-hover:bg-[#F2E9E4] transition-colors">
                <span>View Full Timeline</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
