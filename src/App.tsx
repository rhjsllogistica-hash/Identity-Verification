/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { LoadingStage, LoadingStageItem } from './components/LoadingStage';
import { MobileCameraCapture } from './components/MobileCameraCapture';
import { VerificationComplete } from './components/VerificationComplete';
import { VerificationHub } from './components/VerificationHub';
import { VerificationSession, VerificationStep } from './types';

function generateProtocolCode(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `IV-${randomDigits}`;
}

const INITIAL_LOADING_STAGES: LoadingStageItem[] = [
  {
    id: 'init-1',
    label: 'Estabelecendo conexão segura',
    detail: 'Validando certificado e sessão do atendimento',
  },
  {
    id: 'init-2',
    label: 'Consultando liberação de crédito',
    detail: 'Verificando pendência de procedimento de liberação',
  },
  {
    id: 'init-3',
    label: 'Preparando reconhecimento do recebedor',
    detail: 'Carregando etapas e orientações para verificação',
  },
];

const CAMERA_LOADING_STAGES: LoadingStageItem[] = [
  {
    id: 'cam-1',
    label: 'Inicializando módulo da câmera',
    detail: 'Preparando comunicação com o dispositivo móvel',
  },
  {
    id: 'cam-2',
    label: 'Calibrando moldura de captura',
    detail: 'Ajustando guia de posicionamento facial na tela',
  },
  {
    id: 'cam-3',
    label: 'Abrindo visor do celular',
    detail: 'Disponibilizando botão de captura para o recebedor',
  },
];

const ANALYZING_STAGES: LoadingStageItem[] = [
  {
    id: 'ana-1',
    label: 'Enviando fotografia capturada',
    detail: 'Transmitindo imagem em canal protegido',
  },
  {
    id: 'ana-2',
    label: 'Validando nitidez e enquadramento',
    detail: 'Conferindo iluminação e legibilidade do rosto',
  },
  {
    id: 'ana-3',
    label: 'Confirmando identidade do recebedor',
    detail: 'Cruzando registro facial com a solicitação de crédito',
  },
  {
    id: 'ana-4',
    label: 'Concluindo procedimento de liberação',
    detail: 'Atualizando andamento para etapa final',
  },
];

export default function App() {
  const [step, setStep] = useState<VerificationStep>('initial_loading');
  const [session, setSession] = useState<VerificationSession>(() => ({
    protocolCode: generateProtocolCode(),
    startedAt: new Date().toLocaleString('pt-BR'),
  }));

  const handleInitialComplete = useCallback(() => {
    setStep('hub');
  }, []);

  const handleStartVerification = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep('camera_loading');
  }, []);

  const handleCameraLoadingComplete = useCallback(() => {
    setStep('camera_capture');
  }, []);

  const handlePhotoConfirmed = useCallback(
    (photoUrl: string, source: 'camera' | 'upload' | 'assisted') => {
      setSession((prev) => ({
        ...prev,
        capturedPhotoUrl: photoUrl,
        captureSource: source,
      }));
      setStep('analyzing');
    },
    []
  );

  const handleAnalysisComplete = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      completedAt: new Date().toLocaleString('pt-BR'),
    }));
    setStep('completed');
  }, []);

  const handleReturnHome = useCallback(() => {
    setStep('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReplayInitialLoading = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep('initial_loading');
  }, []);

  const handleRestartFlow = useCallback(() => {
    setSession({
      protocolCode: generateProtocolCode(),
      startedAt: new Date().toLocaleString('pt-BR'),
    });
    setStep('initial_loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigateSection = useCallback((sectionId: string) => {
    setStep('hub');
    setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <Header
        currentStep={step}
        onStartVerification={handleStartVerification}
        onReturnHome={handleReturnHome}
        onNavigateSection={handleNavigateSection}
      />

      <main className="flex-1">
        {step === 'initial_loading' && (
          <LoadingStage
            key="initial-loading"
            title="Carregando ambiente de verificação"
            subtitle="Aguarde alguns instantes enquanto preparamos o sistema e consultamos o status da sua liberação de crédito."
            protocolCode={session.protocolCode}
            stages={INITIAL_LOADING_STAGES}
            durationMs={2300}
            onComplete={handleInitialComplete}
            actionLabel="Continuar para o portal"
          />
        )}

        {step === 'hub' && (
          <VerificationHub
            protocolCode={session.protocolCode}
            onStartVerification={handleStartVerification}
            onReplayInitialLoading={handleReplayInitialLoading}
          />
        )}

        {step === 'camera_loading' && (
          <LoadingStage
            key="camera-loading"
            title="Preparando tela do celular"
            subtitle="Estamos habilitando o visor de captura para que você tire sua foto de reconhecimento do recebedor."
            protocolCode={session.protocolCode}
            stages={CAMERA_LOADING_STAGES}
            durationMs={1800}
            onComplete={handleCameraLoadingComplete}
          />
        )}

        {step === 'camera_capture' && (
          <MobileCameraCapture
            protocolCode={session.protocolCode}
            onPhotoConfirmed={handlePhotoConfirmed}
            onCancel={handleReturnHome}
          />
        )}

        {step === 'analyzing' && (
          <LoadingStage
            key="analyzing-photo"
            title="Verificando foto do recebedor"
            subtitle="Não feche esta página. Estamos processando sua fotografia e concluindo o procedimento de liberação de crédito."
            protocolCode={session.protocolCode}
            stages={ANALYZING_STAGES}
            durationMs={3200}
            photoPreviewUrl={session.capturedPhotoUrl}
            onComplete={handleAnalysisComplete}
          />
        )}

        {step === 'completed' && (
          <VerificationComplete
            session={session}
            onRestart={handleRestartFlow}
          />
        )}
      </main>

      {step === 'hub' && (
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <p className="font-medium text-slate-700">
              Identity Verification · Procedimento de confirmação do recebedor
            </p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => handleNavigateSection('etapas')}
                className="hover:text-slate-900 transition-colors"
              >
                Etapas
              </button>
              <button
                type="button"
                onClick={() => handleNavigateSection('privacidade')}
                className="hover:text-slate-900 transition-colors"
              >
                Privacidade
              </button>
              <button
                type="button"
                onClick={() => handleNavigateSection('ajuda')}
                className="hover:text-slate-900 transition-colors"
              >
                Ajuda
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
