import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTH_NAMES,
  SafeDateResult,
  dateToInGameDay,
  getDaysInMonth,
  getFirstWeekdayOfMonth,
} from "../utils/bluePrinceDate";

interface ManorCalendarProps {
  selectedDay: number;
  safeDate: SafeDateResult;
  onSelectDay: (day: number) => void;
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ManorCalendar: React.FC<ManorCalendarProps> = ({
  selectedDay,
  safeDate,
  onSelectDay,
}) => {
  const [viewYear, setViewYear] = useState<number>(safeDate.year);
  const [viewMonthIndex, setViewMonthIndex] = useState<number>(
    safeDate.monthIndex
  );

  // Keep calendar view synced when user updates day in the main calculator
  useEffect(() => {
    setViewYear(safeDate.year);
    setViewMonthIndex(safeDate.monthIndex);
  }, [safeDate.year, safeDate.monthIndex]);

  const canGoPrev = !(viewYear === 1993 && viewMonthIndex <= 10);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonthIndex === 0) {
      setViewYear((y) => y - 1);
      setViewMonthIndex(11);
    } else {
      setViewMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewYear((y) => y + 1);
      setViewMonthIndex(0);
    } else {
      setViewMonthIndex((m) => m + 1);
    }
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonthIndex);
  const firstWeekday = getFirstWeekdayOfMonth(viewYear, viewMonthIndex);

  const cells: Array<{
    dayOfMonth: number;
    inGameDay: number | null;
    codeMMDD: string;
  } | null> = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mappedDay = dateToInGameDay(viewYear, viewMonthIndex + 1, d);
    const paddedM = String(viewMonthIndex + 1).padStart(2, "0");
    const paddedD = String(d).padStart(2, "0");
    cells.push({
      dayOfMonth: d,
      inGameDay: mappedDay,
      codeMMDD: `${paddedM}${paddedD}`,
    });
  }

  return (
    <section
      id="calendar"
      aria-labelledby="calendar-heading"
      className="bg-[#111B2E] border border-slate-800/90 rounded-xl p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h2
            id="calendar-heading"
            className="text-xl font-semibold text-slate-100 tracking-tight"
          >
            Mount Holly Expedition Calendar
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Select any calendar date to load its corresponding in-game day and
            terminal code
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-[#0B1220] hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="min-w-[168px] text-center font-medium text-slate-100 text-sm sm:text-base">
            {MONTH_NAMES[viewMonthIndex]}{" "}
            <span className="font-mono tabular-nums">{viewYear}</span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-[#0B1220] hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {(viewYear !== safeDate.year ||
            viewMonthIndex !== safeDate.monthIndex) && (
            <button
              type="button"
              onClick={() => {
                setViewYear(safeDate.year);
                setViewMonthIndex(safeDate.monthIndex);
              }}
              className="ml-1 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Jump to Day {selectedDay}
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mt-6">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {WEEKDAY_HEADERS.map((weekday) => (
            <div
              key={weekday}
              className="text-center text-xs font-medium text-slate-400 py-1"
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[60px] sm:min-h-[72px] rounded-lg bg-transparent"
                  aria-hidden="true"
                />
              );
            }

            const isBeforeCampaign = cell.inGameDay === null;
            const isSelected = cell.inGameDay === selectedDay;

            if (isBeforeCampaign) {
              return (
                <div
                  key={cell.dayOfMonth}
                  className="min-h-[60px] sm:min-h-[72px] rounded-lg bg-[#0B1220]/40 p-2 sm:p-2.5 flex flex-col justify-between opacity-40 select-none"
                >
                  <span className="font-mono tabular-nums text-xs text-slate-500">
                    {cell.dayOfMonth}
                  </span>
                  <span className="text-[11px] text-slate-600 hidden sm:inline">
                    Pre-run
                  </span>
                </div>
              );
            }

            return (
              <button
                key={cell.dayOfMonth}
                type="button"
                onClick={() => onSelectDay(cell.inGameDay!)}
                aria-pressed={isSelected}
                className={`min-h-[60px] sm:min-h-[72px] rounded-lg p-2 sm:p-2.5 text-left flex flex-col justify-between transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400 ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-[#0B1220] hover:bg-slate-800/90 text-slate-200"
                }`}
              >
                <div className="flex items-baseline justify-between gap-1 w-full">
                  <span className="font-mono tabular-nums text-xs sm:text-sm font-semibold">
                    {cell.dayOfMonth}
                  </span>
                  <span
                    className={`font-mono tabular-nums text-[11px] hidden md:inline ${
                      isSelected ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {cell.codeMMDD}
                  </span>
                </div>

                <div
                  className={`font-mono tabular-nums text-[11px] sm:text-xs font-medium truncate ${
                    isSelected ? "text-white" : "text-blue-400"
                  }`}
                >
                  Day {cell.inGameDay}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
