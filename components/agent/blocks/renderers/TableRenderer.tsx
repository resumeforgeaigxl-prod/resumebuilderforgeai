'use client';

import React from 'react';
import type { TableBlock } from '../types';
import { cn } from '@/lib/utils';

export function TableRenderer({ block }: { block: TableBlock }) {
  const columns = block.columns || [];
  const rows = block.rows || [];

  if (columns.length === 0 || rows.length === 0) {
    return null;
  }

  return (
    <div className="my-2.5 w-full rounded-xl border border-[#242424] bg-[#101010] shadow-xs overflow-hidden">
      {/* Optional Table Header Title */}
      {block.title && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#151515] border-b border-[#242424]">
          <span className="text-xs font-semibold text-[#F5F5F5]">{block.title}</span>
          <span className="text-[10px] font-mono text-[#7E7E7E]">{rows.length} records</span>
        </div>
      )}

      {/* Responsive Horizontal Scroll Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs divide-y divide-[#242424]">
          <thead className="bg-[#151515] select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-3.5 py-2.5 text-[10px] font-bold font-mono text-[#7E7E7E] uppercase tracking-wider whitespace-nowrap",
                    col.align === 'right' && "text-right",
                    col.align === 'center' && "text-center",
                    col.align === 'left' && "text-left"
                  )}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242424] bg-[#101010]">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[#151515] transition-colors">
                {columns.map((col, cIdx) => {
                  const rawVal = row[col.key];
                  const valStr = String(rawVal ?? '');
                  const isMatchPercent = /^\d{1,3}%$/.test(valStr.trim());
                  const percentNum = isMatchPercent ? parseInt(valStr) : null;

                  return (
                    <td
                      key={cIdx}
                      className={cn(
                        "px-3.5 py-2 text-xs text-[#BDBDBD] whitespace-nowrap font-medium",
                        col.align === 'right' && "text-right",
                        col.align === 'center' && "text-center",
                        col.align === 'left' && "text-left"
                      )}
                    >
                      {isMatchPercent && percentNum !== null ? (
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold",
                            percentNum >= 85
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                              : percentNum >= 70
                              ? "bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30"
                              : "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                          )}
                        >
                          {valStr}
                        </span>
                      ) : (
                        valStr
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {block.caption && (
        <div className="px-3.5 py-1.5 bg-[#151515] border-t border-[#242424] text-[10px] text-[#7E7E7E] font-mono">
          {block.caption}
        </div>
      )}
    </div>
  );
}
