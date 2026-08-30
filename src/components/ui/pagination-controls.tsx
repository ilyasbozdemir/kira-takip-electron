import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  theme?: "dark" | "light";
  className?: string;
  itemLabel?: string; // e.g. "etkinlik", "müşteri", "personel", "kayıt"
}

export function PaginationControls({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  theme = "light",
  className = "",
  itemLabel = "kayıt",
}: PaginationControlsProps): React.JSX.Element | null {
  const isDark = theme === "dark";
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-xs ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-300"
          : "bg-white border-slate-200 text-slate-700 shadow-2xs"
      } ${className}`}
    >
      {/* Left info & Page Size selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Toplam <strong className="text-slate-900 dark:text-slate-100">{totalItems}</strong> {itemLabel} arasından{" "}
          <strong className="text-indigo-600 dark:text-indigo-400">
            {startItem}-{endItem}
          </strong>{" "}
          arası gösteriliyor
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500">Sayfa Başına:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1); // Reset to page 1 on page size change
              }}
              className={`h-7 px-2 text-xs font-semibold rounded-md border cursor-pointer ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-300 text-slate-800"
              }`}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          className={`h-7 w-7 rounded-lg ${
            isDark
              ? "border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              : "border-slate-200 hover:bg-slate-100 disabled:opacity-30"
          }`}
          title="İlk Sayfa"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`h-7 w-7 rounded-lg ${
            isDark
              ? "border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              : "border-slate-200 hover:bg-slate-100 disabled:opacity-30"
          }`}
          title="Önceki Sayfa"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-slate-400 font-mono text-[11px]"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={`page-${pageNum}`}
                size="icon"
                variant={isActive ? "default" : "ghost"}
                onClick={() => onPageChange(pageNum)}
                className={`h-7 min-w-7 px-2 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs"
                    : isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          size="icon"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`h-7 w-7 rounded-lg ${
            isDark
              ? "border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              : "border-slate-200 hover:bg-slate-100 disabled:opacity-30"
          }`}
          title="Sonraki Sayfa"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`h-7 w-7 rounded-lg ${
            isDark
              ? "border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              : "border-slate-200 hover:bg-slate-100 disabled:opacity-30"
          }`}
          title="Son Sayfa"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
