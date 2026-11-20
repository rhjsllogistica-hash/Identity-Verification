/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AccountVerificationWaiting } from './components/AccountVerificationWaiting';
import { CpfVerificationStep } from './components/CpfVerificationStep';
import { Header } from './components/Header';
import { LoadingStage, LoadingStageItem } from './components/LoadingStage';
import { MobileCameraCapture } from './components/MobileCameraCapture';
import { VerificationHub } from './components/VerificationHub';
import { ServerSessionStage, VerificationSession, VerificationStep } from './types';

function generateProtocolCode(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `IV-${randomDigits}`;
}

const INITIAL_LOADING_STAGES: LoadingStageItem[] = [
  {
    id: 'init-1',
    label: 'Conectando aplicativo',
    detail: 'Validando canal seguro e registrando acesso',
  },
  {
    id: 'init-2',
    label: 'Consultando liberação de crédito',
    detail: 'Verificando etapa pendente vinculada ao seu IP',
  },
  {
    id: 'init-3',
    label: 'Carregando reconhecimento do recebedor',
    detail: 'Preparando etapas de verificação no aplicativo',
  },
];

const CAMERA_LOADING_STAGES: LoadingStageItem[] = [
  {
    id: 'cam-1',
    label: 'Inicializando módulo da câmera',
    detail: 'Preparando captura no visor do celular',
  },
  {
    id: 'cam-2',
    label: 'Calibrando guia facial',
    detail: 'Ajustando enquadramento biométrico na tela',
  },
  {
    id: 'cam-3',
    label: 'Abrindo câmera do aplicativo',
    detail: 'Disponibilizando botão de captura para o recebedor',
  },
];

const ANALYZING_STAGES: LoadingStageItem[] = [
  {
    id: 'ana-1',
    label: 'Enviando fotografia capturada',
    detail: 'Transmitindo imagem e gravando acesso do recebedor',
  },
  {
    id: 'ana-2',
    label: 'Validando nitidez e rosto',
    detail: 'Conferindo qualidade da captura facial',
  },
  {
    id: 'ana-3',
    label: 'Iniciando verificação conta de recebedor',
    detail: 'Encaminhando reconhecimento para conferência da conta',
  },
  {
    id: 'ana-4',
    label: 'Salvando continuidade automática',
    detail: 'Mantendo etapa ativa para os próximos acessos',
  },
];

interface ApiSessionResponse {
  ipMasked?: string;
  protocolCode: string;
  stage: ServerSessionStage;
  maskedCpf?: string;
  startedAt: string;
  cpfVerifiedAt?: string;
  photoSubmittedAt?: string;
  capturedPhotoUrl?: string;
}

export default function App() {
  const [step, setStep] = useState<VerificationStep>('initial_loading');
  const [session, setSession] = useState<VerificationSession>(() => ({
    protocolCode: generateProtocolCode(),
    stage: 'hub',
    startedAt: new Date().toLocaleString('pt-BR'),
  }));
  const latestServerStageRef = useRef<ServerSessionStage>('hub');

  const syncSessionFromServer = useCallback(async () => {
    try {
      const response = await fetch('/api/session', { cache: 'no-store' });
      if (!response.ok) return null;
      const data = (await response.json()) as ApiSessionResponse;
      latestServerStageRef.current = data.stage;
      setSession((prev) => ({
        ...prev,
        ipMasked: data.ipMasked ?? prev.ipMasked,
        protocolCode: data.protocolCode || prev.protocolCode,
        stage: data.stage,
        maskedCpf: data.maskedCpf ?? prev.maskedCpf,
        startedAt: data.startedAt || prev.startedAt,
        cpfVerifiedAt: data.cpfVerifiedAt ?? prev.cpfVerifiedAt,
        photoSubmittedAt: data.photoSubmittedAt ?? prev.photoSubmittedAt,
        capturedPhotoUrl: data.capturedPhotoUrl ?? prev.capturedPhotoUrl,
      }));
      if (data.stage === 'account_verification') {
        setStep((current) =>
          current === 'hub' || current === 'cpf_entry' ? 'account_verification' : current
        );
      }
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void syncSessionFromServer();
  }, [syncSessionFromServer]);

  const handleInitialComplete = useCallback(() => {
    setStep((current) => {
      if (current !== 'initial_loading') return current;
      if (latestServerStageRef.current === 'account_verification') {
        return 'account_verification';
      }
      return 'hub';
    });
  }, []);

  const handleStartVerification = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (session.stage === 'account_verification') {
      setStep('account_verification');
      return;
    }
    if (session.stage === 'cpf_verified' && session.maskedCpf) {
      setStep('camera_loading');
      return;
    }
    setStep('cpf_entry');
  }, [session.stage, session.maskedCpf]);

  const handleCpfVerified = useCallback(
    (
      _rawCpf: string,
      maskedCpf: string,
      serverData?: { protocolCode?: string; cpfVerifiedAt?: string }
    ) => {
      latestServerStageRef.current = 'cpf_verified';
      setSession((prev) => ({
        ...prev,
        stage: 'cpf_verified',
        maskedCpf,
        protocolCode: serverData?.protocolCode ?? prev.protocolCode,
        cpfVerifiedAt: serverData?.cpfVerifiedAt ?? new Date().toLocaleString('pt-BR'),
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep('camera_loading');
    },
    []
  );

  const handleCameraLoadingComplete = useCallback(() => {
    setStep('camera_capture');
  }, []);

  const handlePhotoConfirmed = useCallback(
    async (photoUrl: string, source: 'camera' | 'upload' | 'assisted') => {
      latestServerStageRef.current = 'account_verification';
      setSession((prev) => ({
        ...prev,
        capturedPhotoUrl: photoUrl,
        captureSource: source,
        stage: 'account_verification',
        photoSubmittedAt: new Date().toLocaleString('pt-BR'),
      }));
      setStep('analyzing');

      try {
        const res = await fetch('/api/session/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ capturedPhotoUrl: photoUrl }),
        });
        if (res.ok) {
          const data = (await res.json()) as ApiSessionResponse;
          latestServerStageRef.current = data.stage;
          setSession((prev) => ({
            ...prev,
            ipMasked: data.ipMasked ?? prev.ipMasked,
            protocolCode: data.protocolCode || prev.protocolCode,
            stage: data.stage,
            photoSubmittedAt: data.photoSubmittedAt ?? prev.photoSubmittedAt,
          }));
        }
      } catch {
        // State already updated locally
      }
    },
    []
  );

  const handleAnalysisComplete = useCallback(() => {
    setStep('account_verification');
  }, []);

  const handleReturnHome = useCallback(() => {
    if (session.stage === 'account_verification') {
      setStep('account_verification');
      return;
    }
    setStep('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [session.stage]);

  const handleReplayInitialLoading = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep('initial_loading');
  }, []);

  const handleRefreshWaitingStatus = useCallback(async () => {
    await syncSessionFromServer();
  }, [syncSessionFromServer]);

  const handleResetSession = useCallback(async () => {
    latestServerStageRef.current = 'hub';
    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (res.ok) {
        const data = (await res.json()) as ApiSessionResponse;
        setSession({
          ipMasked: data.ipMasked,
          protocolCode: data.protocolCode,
          stage: 'hub',
          startedAt: data.startedAt,
        });
      } else {
        setSession({
          protocolCode: generateProtocolCode(),
          stage: 'hub',
          startedAt: new Date().toLocaleString('pt-BR'),
        });
      }
    } catch {
      setSession({
        protocolCode: generateProtocolCode(),
        stage: 'hub',
        startedAt: new Date().toLocaleString('pt-BR'),
      });
    }
    setStep('initial_loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 text-slate-900">
      <Header
        currentStep={step}
        protocolCode={session.protocolCode}
        onReturnHome={handleReturnHome}
      />

      <main className="flex-1">
        {step === 'initial_loading' && (
          <LoadingStage
            key="initial-loading"
            title="Iniciando Identity Verification"
            subtitle="Verificando seu acesso e consultando a etapa atual da sua liberação de crédito."
            protocolCode={session.protocolCode}
            stages={INITIAL_LOADING_STAGES}
            durationMs={2100}
            onComplete={handleInitialComplete}
            actionLabel="Continuar"
          />
        )}

        {step === 'hub' && (
          <VerificationHub
            protocolCode={session.protocolCode}
            maskedCpf={session.maskedCpf}
            ipMasked={session.ipMasked}
            onStartVerification={handleStartVerification}
            onReplayInitialLoading={handleReplayInitialLoading}
          />
        )}

        {step === 'cpf_entry' && (
          <CpfVerificationStep
            protocolCode={session.protocolCode}
            existingMaskedCpf={session.maskedCpf}
            onCpfVerified={handleCpfVerified}
            onCancel={handleReturnHome}
          />
        )}

        {step === 'camera_loading' && (
          <LoadingStage
            key="camera-loading"
            title="Preparando câmera do celular"
            subtitle="CPF identificado. Abrindo a tela do aparelho para o processo de reconhecimento facial."
            protocolCode={session.protocolCode}
            stages={CAMERA_LOADING_STAGES}
            durationMs={1600}
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
            title="Processando foto do recebedor"
            subtitle="Aguarde enquanto gravamos seu acesso e iniciamos a verificação da conta do recebedor."
            protocolCode={session.protocolCode}
            stages={ANALYZING_STAGES}
            durationMs={2900}
            photoPreviewUrl={session.capturedPhotoUrl}
            onComplete={handleAnalysisComplete}
          />
        )}

        {step === 'account_verification' && (
          <AccountVerificationWaiting
            session={session}
            onRefreshStatus={handleRefreshWaitingStatus}
            onResetSession={handleResetSession}
          />
        )}
      </main>
    </div>
  );
}
