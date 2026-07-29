import React from 'react';
import { ComplaintStatus } from '../types';
import { Clock, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus | 'Active' | 'Under Clean-Up' | 'Cleared';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2',
  }[size];

  switch (status) {
    case 'Pending Approval':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-100 text-purple-900 border border-purple-300/60 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
          <span>Pending Approval</span>
        </span>
      );
    case 'Pending':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Pending</span>
        </span>
      );
    case 'In Progress':
    case 'Under Clean-Up':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-100 text-blue-900 border border-blue-300/60 ${sizeClasses}`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-700 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
          <span>{status}</span>
        </span>
      );
    case 'Resolved':
    case 'Cleared':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/60 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Rejected':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-100 text-rose-900 border border-rose-300/60 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
          <span>Rejected</span>
        </span>
      );
    case 'Active':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-100 text-rose-900 border border-rose-300/60 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
          <span>Active Hotspot</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-800 ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};
