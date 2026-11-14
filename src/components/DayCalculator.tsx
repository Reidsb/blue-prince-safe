import React, { useState, useEffect } from "react";
import { Minus, Plus, Copy, Check, RotateCcw } from "lucide-react";
import {
  SafeDateResult,
  TimeRecommendation,
  clampDay,
  calculateSafeDate,
} from "../utils/bluePrinceDate";

interface DayCalculatorProps {
  day: number;
  onChangeDay: (newDay: number) => void;
  safeDate: SafeDateResult;
  timeRec: TimeRecommendation;
}

const MILESTONE_DAYS = [1, 5, 15, 25, 40, 56, 100];

export const DayCalculator: React.FC<DayCalculatorProps> = ({
  day,
  onChangeDay,
  safeDate,
  timeRec,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(day));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(String(day));
  }, [day]);

  const effectiveSafeDate = timeRec.rollsIntoNextDay
    ? calculateSafeDate(day + 1)
    : safeDate;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      onChangeDay(clampDay(parsed));
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setInputValue(String(day));
    } else {
      const clamped = clampDay(parsed);
      onChangeDay(clamped);
      setInputValue(String(clamped));
    }
  };

  const stepDay = (delta: number) => {
    onChangeDay(clampDay(day + delta));
  };

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    } catch {
      // Clipboard fallback ignored cleanly in restricted frames
    }
  };

  return (
    <section
      aria-labelledby="calculator-heading"
      className="flex-1 bg-[#111B2E] border border-slate-800/90 rounded-xl overflow-hidden flex flex-col justify-between"
    >
      {/* Top Section: In-Game Day Input */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div>
            <h2
              id="calculator-heading"
              className="text-xl font-semibold text-slate-100 tracking-tight"
            >
              In-Game Day Input
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Check your Map or Inventory screen for your current run day
            </p>
          </div>
          {day !== 1 && (
            <button
              type="button"
              onClick={() => onChangeDay(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset to Day 1
            </button>
          )}
        </div>

        {/* Stepper + Direct Number Field */}
        <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2.5">
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => stepDay(-10)}
              disabled={day <= 1}
              aria-label="Subtract 10 days"
              className="min-h-[48px] px-3.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white font-mono tabular-nums text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => stepDay(-1)}
              disabled={day <= 1}
              aria-label="Previous day"
              className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-slate-900/90 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 hover:text-white transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <label className="relative flex-1 min-w-[160px] flex items-center bg-[#0B1220] rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
            <span className="text-sm font-medium text-slate-400 select-none mr-3 whitespace-nowrap">
              Day
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              aria-label="In-game day number"
              className="w-full bg-transparent text-right font-mono tabular-nums text-2xl sm:text-3xl font-bold text-white focus:outline-none"
            />
          </label>

          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => stepDay(1)}
              disabled={day >= 9999}
              aria-label="Next day"
              className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => stepDay(10)}
              disabled={day >= 9999}
              aria-label="Add 10 days"
              className="min-h-[48px] px-3.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 hover:text-white font-mono tabular-nums text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              +10
            </button>
          </div>
        </div>

        {/* Quick Jump Segmented Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1.5 whitespace-nowrap">
            Quick select:
          </span>
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#0B1220] rounded-lg">
            {MILESTONE_DAYS.map((preset) => {
              const active = day === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChangeDay(preset)}
                  className={`px-2.5 py-1 text-xs font-mono tabular-nums font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Day {preset}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle Section: Primary Safe Date Readout */}
      <div className="border-t border-slate-800/90 px-6 sm:px-8 py-7 bg-[#0E1729]">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Shelter Computer Terminal</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            Day {effectiveSafeDate.inGameDay}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {effectiveSafeDate.daysElapsed === 0
              ? "Campaign start date"
              : `+${effectiveSafeDate.daysElapsed} ${
                  effectiveSafeDate.daysElapsed === 1 ? "day" : "days"
                } from Nov 7, 1993`}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {effectiveSafeDate.fullFormatted}
            </div>
            {timeRec.rollsIntoNextDay && (
              <p className="text-xs text-amber-300 mt-1.5">
                Current manor clock is past 10:45 PM — terminal target rolls into
                Day {day + 1} ({effectiveSafeDate.fullFormatted}).
              </p>
            )}
          </div>

          <div className="font-mono tabular-nums text-xl sm:text-2xl font-semibold text-blue-400">
            {effectiveSafeDate.slashMMDDYYYY}
          </div>
        </div>

        {/* 4-Column Hairline Grid matching the Shelter Terminal Dropdowns */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-y-6 sm:gap-y-0 sm:divide-x sm:divide-slate-800/80">
          <div className="sm:pr-5">
            <div className="text-xs text-slate-400">Terminal Month</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-100">
              {effectiveSafeDate.paddedMonth}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {effectiveSafeDate.monthName}
            </div>
          </div>

          <div className="sm:px-5">
            <div className="text-xs text-slate-400">Terminal Day</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-100">
              {effectiveSafeDate.paddedDay}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Day of {effectiveSafeDate.monthShort}
            </div>
          </div>

          <div className="sm:px-5">
            <div className="text-xs text-slate-400">Terminal Year</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-100">
              {effectiveSafeDate.year}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {effectiveSafeDate.year === 1993
                ? "Year 1 of expedition"
                : `Year ${effectiveSafeDate.year - 1992} of expedition`}
            </div>
          </div>

          <div className="sm:pl-5">
            <div className="text-xs text-slate-400">Safe Unlock Time</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-blue-400">
              {timeRec.recommendedLabel12h}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              At least +1 hr ahead
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Numeric Safe Formats & One-Click Copy */}
      <div className="border-t border-slate-800/90 px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-slate-400">4-Digit Date (MMDD)</div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-mono tabular-nums text-lg font-semibold text-slate-100">
                {effectiveSafeDate.fourDigitMMDD}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyText("mmdd", effectiveSafeDate.fourDigitMMDD)
                }
                aria-label={`Copy 4-digit MMDD code ${effectiveSafeDate.fourDigitMMDD}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedKey === "mmdd" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" aria-hidden="true" />

          <div>
            <div className="text-xs text-slate-400">4-Digit Alt (DDMM)</div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-mono tabular-nums text-lg font-semibold text-slate-300">
                {effectiveSafeDate.fourDigitDDMM}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyText("ddmm", effectiveSafeDate.fourDigitDDMM)
                }
                aria-label={`Copy 4-digit DDMM code ${effectiveSafeDate.fourDigitDDMM}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedKey === "ddmm" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            copyText(
              "full",
              `${effectiveSafeDate.compactMMDDYYYY} — ${timeRec.recommendedLabel12h}`
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copiedKey === "full" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied Full Setting</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Date & Time</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
