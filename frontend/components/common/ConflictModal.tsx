"use client";

import { createPortal } from "react-dom";

interface ConflictData {
  type: "accounts" | "wishes";
  localCount: number;
  cloudCount: number;
  localModifiedAt: Date | null;
  cloudModifiedAt: Date | null;
  localData: any[];
  cloudData: any[];
}

interface ConflictModalProps {
  isOpen: boolean;
  conflictData: ConflictData | null;
  onResolve: (resolution: "local" | "cloud") => void;
  onDownloadBoth: () => void;
  onClose: () => void;
}

export default function ConflictModal({
  isOpen,
  conflictData,
  onResolve,
  onDownloadBoth,
  onClose,
}: ConflictModalProps) {
  if (!isOpen || !conflictData) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isLocalNewer =
    conflictData.localModifiedAt && conflictData.cloudModifiedAt
      ? conflictData.localModifiedAt > conflictData.cloudModifiedAt
      : conflictData.localModifiedAt !== null;

  const dataType = conflictData.type === "accounts" ? "Accounts" : "Wishes";
  const localLabel = isLocalNewer ? "NEWER" : "OLDER";
  const cloudLabel = isLocalNewer ? "OLDER" : "NEWER";

  const handleResolve = (resolution: "local" | "cloud") => {
    onResolve(resolution);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-[#09090b]/95 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-white/10 p-6 rounded-xl max-w-lg w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Data Conflict Detected</h3>
            <p className="text-gray-400 text-sm">Your {dataType.toLowerCase()} data differs from the cloud</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Local Browser Data</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${isLocalNewer ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {localLabel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">
                {conflictData.localCount} {conflictData.localCount === 1 ? "item" : "items"}
              </span>
              <span className="text-gray-500 text-xs">
                {formatDate(conflictData.localModifiedAt)}
              </span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Cloud Data</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${!isLocalNewer ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {cloudLabel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">
                {conflictData.cloudCount} {conflictData.cloudCount === 1 ? "item" : "items"}
              </span>
              <span className="text-gray-500 text-xs">
                {formatDate(conflictData.cloudModifiedAt)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4">
          Which version would you like to keep?
        </p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handleResolve("local")}
            className="cursor-pointer flex-1 px-4 py-2.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white rounded-lg text-sm font-bold transition-colors"
          >
            Keep Local
          </button>
          <button
            onClick={() => handleResolve("cloud")}
            className="cursor-pointer flex-1 px-4 py-2.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white rounded-lg text-sm font-bold transition-colors"
          >
            Keep Cloud
          </button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <button
            onClick={onDownloadBoth}
            className="cursor-pointer w-full px-4 py-2.5 bg-transparent border border-[#52525b] hover:border-theme text-gray-300 hover:text-white rounded-lg text-sm font-bold transition-colors"
          >
            Download Both Files
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function downloadConflictData(data: any[], source: string, type: string) {
  const exportData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    source: source,
    type: type,
    count: data.length,
    data: data,
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `senti-moe-${type}-${source}-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadBothConflictFiles(localData: any[], cloudData: any[], type: string) {
  downloadConflictData(localData, "local", type);
  setTimeout(() => {
    downloadConflictData(cloudData, "cloud", type);
  }, 500);
}