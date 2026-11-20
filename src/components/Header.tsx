import React from 'react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { VerificationStep } from '../types';

interface HeaderProps {
  currentStep: VerificationStep;
  protocolCode: string;
  onReturnHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  protocolCode,
  onReturnHome,
}) => {
  const canGoBack =
    currentStep === 'cpf_entry' ||
    currentStep === 'camera_loading' ||
    currentStep === 'camera_capture';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          {canGoBack ? (
            <button
              type="button"
              onClick={onReturnHome}
              aria-label="Voltar"
              className="flex h-10 w-10 -ml-2 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
          )}

          <span className="font-display truncate text-base font-bold tracking-tight text-slate-900">
            Identity Verification
          </span>
        </div>

        <span className="font-mono-tabular text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
          {protocolCode}
        </span>
      </div>
    </header>
  );
};
