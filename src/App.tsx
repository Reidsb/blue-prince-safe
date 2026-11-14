import { useState, useEffect, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import {
  calculateSafeDate,
  calculateUnlockTime,
  clampDay,
} from "./utils/bluePrinceDate";
import { DayCalculator } from "./components/DayCalculator";
import { UnlockTimeHelper } from "./components/UnlockTimeHelper";
import { ManorCalendar } from "./components/ManorCalendar";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { OfflineIndicator } from "./components/OfflineIndicator";

const STORAGE_KEY = "bp_shelter_safe_day_v1";

export default function App() {
  const [day, setDay] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed) && parsed >= 1) {
          return clampDay(parsed);
        }
      }
    } catch {
      // Ignore storage access errors in private contexts
    }
    return 1;
  });

  const [realMinutesElapsed, setRealMinutesElapsed] = useState<number>(0);
  const [headerCopied, setHeaderCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(day));
    } catch {
      // Ignore storage write errors
    }
  }, [day]);

  const safeDate = useMemo(() => calculateSafeDate(day), [day]);
  const timeRec = useMemo(
    () => calculateUnlockTime(realMinutesElapsed),
    [realMinutesElapsed]
  );

  const effectiveHeaderDate = useMemo(
    () =>
      timeRec.rollsIntoNextDay ? calculateSafeDate(day + 1) : safeDate,
    [timeRec.rollsIntoNextDay, day, safeDate]
  );

  const handleCopyHeaderSummary = async () => {
    try {
      await navigator.clipboard.writeText(
        `${effectiveHeaderDate.compactMMDDYYYY} (${timeRec.recommendedLabel12h})`
      );
      setHeaderCopied(true);
      window.setTimeout(() => setHeaderCopied(false), 1800);
    } catch {
      // Ignore clipboard errors in restricted frames
    }
  };

  return (
    <div className="min-h-screen blueprint-surface text-slate-100 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="border-b border-slate-800/90 bg-[#0B1220]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#calculator"
            className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            Mount Holly Safe Ledger
          </a>

          {/* Zone 2: 4 concise single-line text links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
          >
            <a
              href="#calculator"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Calculator
            </a>
            <a
              href="#unlock-timer"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Unlock Timer
            </a>
            <a
              href="#calendar"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Calendar
            </a>
            <a
              href="#field-notes"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Field Notes
            </a>
          </nav>

          {/* Zone 3: 1 primary action (Install App until installed, then Copy Safe Date) */}
          <div className="flex items-center shrink-0">
            <PWAInstallButton
              installedFallback={
                <button
                  type="button"
                  onClick={handleCopyHeaderSummary}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  {headerCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copied Safe Date</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copy Safe Date</span>
                    </>
                  )}
                </button>
              }
            />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* Focused Utility Header */}
        <div id="calculator" className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2.5">
            <span>Blue Prince</span>
            <span aria-hidden="true">·</span>
            <span>Shelter Outer Room</span>
            <span aria-hidden="true">·</span>
            <span>Day 1 begins November 7, 1993</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
            Shelter Time-Lock Safe Calculator
          </h1>
          <p className="text-base text-slate-400 mt-2.5 leading-relaxed">
            Enter your current in-game day to get the exact calendar date,
            4-digit number, and recommended unlock hour for the Shelter computer
            terminal.
          </p>
        </div>

        {/* Primary Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <DayCalculator
              day={day}
              onChangeDay={setDay}
              safeDate={safeDate}
              timeRec={timeRec}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <UnlockTimeHelper
              realMinutesElapsed={realMinutesElapsed}
              onChangeRealMinutes={setRealMinutesElapsed}
              timeRec={timeRec}
            />
          </div>
        </div>

        {/* Interactive Expedition Calendar */}
        <ManorCalendar
          selectedDay={day}
          safeDate={safeDate}
          onSelectDay={(selected) => {
            setDay(selected);
          }}
        />

        {/* Essential Terminal Rules & Troubleshooting */}
        <section
          id="field-notes"
          aria-labelledby="field-notes-heading"
          className="bg-[#111B2E] border border-slate-800/90 rounded-xl p-6 sm:p-8"
        >
          <div className="pb-6 border-b border-slate-800/80">
            <h2
              id="field-notes-heading"
              className="text-xl font-semibold text-slate-100 tracking-tight"
            >
              Shelter Terminal Rules & Troubleshooting
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Why the Time-Lock Safe fails to open even when you know the right
              day
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-slate-800/80">
            <div className="md:pr-6">
              <h3 className="text-base font-semibold text-slate-100">
                01. Finding Your Day Count
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Open your floorplan map or inventory screen during a run to read
                your exact Day number. Day 1 is November 7, 1993, and November
                has 30 days (Day 25 rolls into December 1, 1993).
              </p>
            </div>

            <div className="md:px-6">
              <h3 className="text-base font-semibold text-slate-100">
                02. The One-Hour Lead Rule
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                The terminal requires a time at least 1 full hour ahead of the
                estate clock. Runs begin at 8:00 AM; drafting the Shelter early
                and setting 10:00 AM unlocks the safe for 4 hours (remember noon
                is 12:00 PM, not 12:00 AM).
              </p>
            </div>

            <div className="md:pl-6">
              <h3 className="text-base font-semibold text-slate-100">
                03. System Clock Locale Bug
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                On PCs configured with non-US regional 24-hour date/time
                formats, the Shelter terminal can fail to trigger. Switching
                your OS regional short time format to English (United States)
                AM/PM resolves the issue.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 mt-8">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            Mount Holly Safe Ledger · Unofficial player reference for Blue
            Prince
          </span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Back to top
          </button>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );
}
