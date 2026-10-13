import React, { useState } from 'react';
import { Sparkles, Calendar, Palmtree, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { LongWeekendItem } from '../types/calendar';

interface LongWeekendBannerProps {
  items: LongWeekendItem[];
}

export const LongWeekendBanner: React.FC<LongWeekendBannerProps> = ({ items }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const firstItem = items[0];

  return (
    <div className="w-full mb-3 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/40 p-3 sm:p-3.5 shadow-sm text-stone-900 dark:text-stone-100 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Palmtree className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                {firstItem.type === 'harpitnas' ? 'Peluang Harpitnas' : 'Long Weekend'}
              </span>
              <h4 className="text-xs sm:text-sm font-bold">
                {firstItem.holidayTitle} ({firstItem.holidayDayName}) &bull; {firstItem.daysCount} Hari Libur
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              {firstItem.recommendation}
            </p>
          </div>
        </div>

        {items.length > 1 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-600 dark:text-stone-400 transition-colors cursor-pointer shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expanded list jika lebih dari 1 */}
      {isExpanded && items.length > 1 && (
        <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800/50 space-y-2">
          {items.slice(1).map((item, idx) => (
            <div key={idx} className="text-xs p-2 rounded-lg bg-white/60 dark:bg-stone-900/40 flex items-start gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 shrink-0 mt-0.5">
                {item.type === 'harpitnas' ? 'Harpitnas' : 'Long Weekend'}
              </span>
              <div>
                <strong>{item.holidayTitle}</strong>: {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
