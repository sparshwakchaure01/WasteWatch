import React from 'react';
import { WasteCategory } from '../types';
import { Wine, Home, HardHat, Leaf, Cpu, HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  category: WasteCategory;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, showIcon = true }) => {
  const getConfig = (cat: WasteCategory) => {
    switch (cat) {
      case 'Plastic Waste':
        return {
          icon: Wine,
          style: 'bg-[#4A4E69]/10 text-[#22223B] border-[#4A4E69]/20',
        };
      case 'Household Waste':
        return {
          icon: Home,
          style: 'bg-amber-500/10 text-amber-900 border-amber-500/20',
        };
      case 'Construction Debris':
        return {
          icon: HardHat,
          style: 'bg-stone-500/10 text-stone-900 border-stone-500/20',
        };
      case 'Garden Waste':
        return {
          icon: Leaf,
          style: 'bg-emerald-500/10 text-emerald-900 border-emerald-500/20',
        };
      case 'Electronic Waste':
        return {
          icon: Cpu,
          style: 'bg-purple-500/10 text-purple-900 border-purple-500/20',
        };
      default:
        return {
          icon: HelpCircle,
          style: 'bg-slate-500/10 text-slate-800 border-slate-500/20',
        };
    }
  };

  const { icon: Icon, style } = getConfig(category);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 opacity-80" />}
      <span>{category}</span>
    </span>
  );
};
