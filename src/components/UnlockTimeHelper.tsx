import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { TimeRecommendation } from "../utils/bluePrinceDate";

interface UnlockTimeHelperProps {
  realMinutesElapsed: number;
  onChangeRealMinutes: (mins: number) => void;
  timeRec: TimeRecommendation;
}

const CLOCK_PRESETS = [
  { label: "8:00 AM (Start)", realMins: 0 },
  { label: "9:00 AM (+5m)", realMins: 5 },
  { label: "10:00 AM (+10m)", realMins: 10 },
  { label: "12:00 PM (+20m)", realMins: 20 },
  { label: "2:00 PM (+30m)", realMins: 30 },
];

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const UnlockTimeHelper: React.FC<UnlockTimeHelperProps> = ({
  realMinutesElapsed,
  onChangeRealMinutes,
  timeRec,
}) => {
  const [countdownSeconds, setCountdownSeconds] = useState<number>(
    timeRec.realSecondsToWait
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Sync countdown target when user changes slider while timer is not running
  useEffect(() => {
    if (!isRunning) {
      setCountdownSeconds(timeRec.realSecondsToWait);
    }
  }, [timeRec.realSecondsToWait, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const handleResetTimer = () => {
    setIsRunning(false);
    setCountdownSeconds(timeRec.realSecondsToWait);
  };

  return (
    <section
      id="unlock-timer"
      aria-labelledby="time-helper-heading"
      className="flex-1 bg-[#111B2E] border border-slate-800/90 rounded-xl overflow-hidden flex flex-col justify-between"
    >
      <div className="p-6 sm:p-8">
        <h2
          id="time-helper-heading"
          className="text-xl font-semibold text-slate-100 tracking-tight"
        >
          Terminal Time & Wait Calculator
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Every run starts at 8:00 AM (5 real minutes = 1 manor hour). The safe
          must be set at least 1 hour ahead.
        </p>

        {/* Slider for Current Run Elapsed Time */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <label
              htmlFor="run-minutes-slider"
              className="text-xs font-medium text-slate-300"
            >
              Current Estate Clock / Time in Run
            </label>
            <span className="font-mono tabular-nums text-sm font-semibold text-blue-400">
              {timeRec.estimatedClockLabel} ({realMinutesElapsed}m played)
            </span>
          </div>

          <input
            id="run-minutes-slider"
            type="range"
            min={0}
            max={50}
            step={1}
            value={realMinutesElapsed}
            onChange={(e) => {
              setIsRunning(false);
              onChangeRealMinutes(Number(e.target.value));
            }}
            className="w-full h-2 bg-[#0B1220] rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {CLOCK_PRESETS.map((preset) => {
              const active = realMinutesElapsed === preset.realMins;
              return (
                <button
                  key={preset.realMins}
                  type="button"
                  onClick={() => {
                    setIsRunning(false);
                    onChangeRealMinutes(preset.realMins);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-[#0B1220] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommended Time & Open Window Breakdown */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400">Set Terminal Time To</div>
            <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-white">
              {timeRec.recommendedLabel12h}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              24h equivalent: {timeRec.recommendedLabel24h}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Safe Remains Unlocked</div>
            <div className="mt-1 font-mono tabular-nums text-lg font-semibold text-slate-200">
              {timeRec.recommendedLabel12h} – {timeRec.windowEndLabel12h}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              4-hour window (~20m real time)
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Wait Countdown Timer */}
      <div className="border-t border-slate-800/90 px-6 sm:px-8 py-5 bg-[#0E1729] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400">
            {countdownSeconds === 0
              ? "Safe Status"
              : "Estimated Real-World Wait"}
          </div>
          <div className="mt-0.5 flex items-baseline gap-2.5">
            <span
              className={`font-mono tabular-nums text-2xl font-bold ${
                countdownSeconds === 0 ? "text-emerald-400" : "text-slate-100"
              }`}
            >
              {formatCountdown(countdownSeconds)}
            </span>
            <span className="text-xs text-slate-400">
              {countdownSeconds === 0
                ? "Safe door is now unlocked"
                : isRunning
                ? "Counting down..."
                : "Until safe opens"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (countdownSeconds === 0) {
                setCountdownSeconds(timeRec.realSecondsToWait);
                setIsRunning(true);
              } else {
                setIsRunning((prev) => !prev);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {countdownSeconds === 0 ? "Restart Timer" : "Start Timer"}
                </span>
              </>
            )}
          </button>

          {(isRunning || countdownSeconds !== timeRec.realSecondsToWait) && (
            <button
              type="button"
              onClick={handleResetTimer}
              aria-label="Reset countdown timer"
              className="min-h-[34px] px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
