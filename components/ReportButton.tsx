"use client";

import { useState } from 'react';
import ReportModal from './ReportModal';

interface ReportButtonProps {
  promptId: string;
  promptTitle: string;
}

export default function ReportButton({ promptId, promptTitle }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded text-sm font-medium text-red-400 transition"
        title="Report this prompt for violations"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        Report
      </button>
      <ReportModal
        promptId={promptId}
        promptTitle={promptTitle}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
