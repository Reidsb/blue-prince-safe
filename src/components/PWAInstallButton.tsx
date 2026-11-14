import React, { useState } from "react";
import { Download, Smartphone, FileDown, FolderArchive, X } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallButtonProps {
  installedFallback?: React.ReactNode;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  installedFallback = null,
}) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } =
    usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  const isLocalFile =
    typeof window !== "undefined" &&
    !window.location.protocol.startsWith("http");

  // Hide install button once running as an installed standalone PWA or local offline HTML file
  if (isInstalled || isLocalFile) {
    return <>{installedFallback}</>;
  }

  // Native Chromium / Android / Desktop direct 1-tap install prompt (active once hosted outside iframe)
  if (isInstallable && !isInIframe) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Install Offline App</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-[#111B2E] border border-slate-700/90 p-6 text-slate-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3
                  id="pwa-guide-title"
                  className="text-lg font-semibold text-white"
                >
                  {isInIframe
                    ? "Get This App Offline on Your Phone"
                    : "Add Safe Ledger to Home Screen"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isInIframe
                    ? "No GitHub or coding needed — pick whichever option is easiest for you."
                    : "Save this page to your Home Screen so it works offline."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close installation guide"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-300">
              {isInIframe ? (
                <>
                  {/* Option A: Instant 1-File Offline Download */}
                  <div className="p-4 rounded-lg bg-[#0B1220] border border-slate-800 space-y-2.5">
                    <div className="text-xs font-semibold text-white">
                      Option 1 — Instant Offline File (Zero Accounts)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Download the entire calculator packed into a single
                      offline file. Open it from your phone&apos;s{" "}
                      <strong className="text-slate-200">Downloads</strong>{" "}
                      folder anytime—even in Airplane Mode.
                    </p>
                    <a
                      href="/blue-prince-safe-offline.html"
                      download="blue-prince-safe-offline.html"
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap"
                    >
                      <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Download Offline File (.html)</span>
                    </a>
                  </div>

                  {/* Option B: Home Screen App Icon via Netlify Drop (No GitHub needed) */}
                  <div className="p-4 rounded-lg bg-[#0B1220] border border-slate-800 space-y-2.5">
                    <div className="text-xs font-semibold text-white">
                      Option 2 — Home Screen App Icon (Free, No GitHub)
                    </div>
                    <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1 leading-relaxed">
                      <li>Download the ready-to-host ZIP bundle below.</li>
                      <li>
                        Upload that ZIP at{" "}
                        <strong className="text-slate-200">
                          app.netlify.com/drop
                        </strong>{" "}
                        (free, no credit card).
                      </li>
                      <li>
                        Open the <span className="font-mono">netlify.app</span>{" "}
                        link it gives you in{" "}
                        <strong className="text-slate-200">Chrome</strong> on
                        your phone and tap{" "}
                        <strong className="text-slate-200">
                          Install Offline App
                        </strong>
                        .
                      </li>
                    </ol>
                    <a
                      href="/safe-ledger-pwa.zip"
                      download="safe-ledger-pwa.zip"
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors whitespace-nowrap"
                    >
                      <FolderArchive className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                      <span>Download Ready-to-Host ZIP</span>
                    </a>
                  </div>
                </>
              ) : isIOS ? (
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    iPhone or iPad (Safari)
                  </h4>
                  <ol className="mt-1.5 space-y-1.5 text-xs text-slate-400 list-decimal list-inside leading-relaxed">
                    <li>
                      Tap Safari&apos;s{" "}
                      <strong className="text-slate-200">Share</strong> button
                      (square with an upward arrow).
                    </li>
                    <li>
                      Scroll down and tap{" "}
                      <strong className="text-slate-200">
                        Add to Home Screen
                      </strong>
                      , then tap <strong className="text-slate-200">Add</strong>.
                    </li>
                  </ol>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Android or Desktop (Chrome)
                  </h4>
                  <ol className="mt-1.5 space-y-1.5 text-xs text-slate-400 list-decimal list-inside leading-relaxed">
                    <li>
                      Tap Chrome&apos;s{" "}
                      <strong className="text-slate-200">⋮</strong> menu in the
                      top-right corner.
                    </li>
                    <li>
                      Select{" "}
                      <strong className="text-slate-200">Install app</strong> or{" "}
                      <strong className="text-slate-200">
                        Add to Home screen
                      </strong>
                      .
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
