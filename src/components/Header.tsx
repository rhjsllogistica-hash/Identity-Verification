import React from 'react';
import { VerificationStep } from '../types';

interface HeaderProps {
  currentStep: VerificationStep;
  onStartVerification: () => void;
  onReturnHome: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStartVerification,
  onReturnHome,
  onNavigateSection,
}) => {
  const isInFlow = currentStep !== 'hub';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onReturnHome}
          className="font-display text-left text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          Identity Verification
        </button>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onNavigateSection('etapas')}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Etapas
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('requisitos')}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Requisitos
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('privacidade')}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Privacidade
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('ajuda')}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Ajuda
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          {isInFlow ? (
            <button
              type="button"
              onClick={onReturnHome}
              className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Voltar ao início
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartVerification}
              className="min-h-[40px] rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Iniciar verificação
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
