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
import { PhotoSuccessStep } from './components/PhotoSuccessStep';
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
    detail: 'Validando canal seguro e sessão do atendimento',
  },
  {
    id: 'init-2',
    label: 'Consultando liberação de crédito',
    detail: 'Verificando etapa pendente do seu atendimento',
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

const PHOTO_VERIFICATION_STAGES: LoadingStageItem[] = [
  {
    id: 'ana-1',
    label: 'Processando captura recebida',
    detail: 'Analisando imagem em memória temporária',
  },
  {
    id: 'ana-2',
    label: 'Verificando nitidez e iluminação',
    detail: 'Conferindo qualidade da foto do recebedor',
  },
  {
    id: 'ana-3',
    label: 'Validando reconhecimento facial',
    detail: 'Confirmando aprovação da etapa facial',
  },
  {
    id: 'ana-4',
    label: 'Registrando etapa concluída',
    detail: 'Encaminhando para verificação de conta do recebedor',
  },
];

interface ApiSessionResponse {
  protocolCode: string;
  stage: ServerSessionStage;
  startedAt: string;
  cpfVerifiedAt?: string;
  photoSubmittedAt?: string;
}

const STORAGE_KEY = 'identity_verification_stage_v2';

function loadLocalSession(): VerificationSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VerificationSession;
  } catch {
    return null;
  }
}

function saveLocalSession(session: VerificationSession): void {
  try {
    // Store only protocol, stage, and timestamps — never personal CPF or photo
    const safeSession: VerificationSession = {
      protocolCode: session.protocolCode,
      stage: session.stage,
      startedAt: session.startedAt,
      cpfVerifiedAt: session.cpfVerifiedAt,
      photoSubmittedAt: session.photoSubmittedAt,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSession));
  } catch {
    // Ignore storage errors
  }
}

export default function App() {
  const [step, setStep] = useState<VerificationStep>('initial_loading');
  const [transientPhotoPreview, setTransientPhotoPreview] = useState<string | undefined>(
    undefined
  );
  const [session, setSession] = useState<VerificationSession>(() => {
    const saved = loadLocalSession();
    if (saved) return saved;
    return {
      protocolCode: generateProtocolCode(),
      stage: 'hub',
      startedAt: new Date().toLocaleString('pt-BR'),
    };
  });
  const latestServerStageRef = useRef<ServerSessionStage>(session.stage);

  useEffect(() => {
    saveLocalSession(session);
  }, [session]);

  const syncSessionFromServer = useCallback(async () => {
    try {
      const response = await fetch('/api/session', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) return null;

      const data = (await response.json()) as ApiSessionResponse;
      setSession((prev) => {
        const mergedStage =
          data.stage === 'hub' && prev.stage !== 'hub' ? prev.stage : data.stage;
        latestServerStageRef.current = mergedStage;
        return {
          ...prev,
          protocolCode: data.protocolCode || prev.protocolCode,
          stage: mergedStage,
          startedAt: data.startedAt || prev.startedAt,
          cpfVerifiedAt: data.cpfVerifiedAt ?? prev.cpfVerifiedAt,
          photoSubmittedAt: data.photoSubmittedAt ?? prev.photoSubmittedAt,
        };
      });
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
    if (session.stage === 'cpf_verified') {
      setStep('camera_loading');
      return;
    }
    setStep('cpf_entry');
  }, [session.stage]);

  const handleCpfVerified = useCallback(
    (
      _rawCpf: string,
      _maskedCpf: string,
      serverData?: { protocolCode?: string; cpfVerifiedAt?: string }
    ) => {
      latestServerStageRef.current = 'cpf_verified';
      setSession((prev) => ({
        ...prev,
        stage: 'cpf_verified',
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
    async (photoUrl: string) => {
      // Keep photo only in volatile React state during immediate verification display
      setTransientPhotoPreview(photoUrl);
      latestServerStageRef.current = 'account_verification';
      setSession((prev) => ({
        ...prev,
        stage: 'account_verification',
        photoSubmittedAt: new Date().toLocaleString('pt-BR'),
      }));
      setStep('analyzing');

      try {
        const res = await fetch('/api/session/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = (await res.json()) as ApiSessionResponse;
          latestServerStageRef.current = data.stage;
          setSession((prev) => ({
            ...prev,
            protocolCode: data.protocolCode || prev.protocolCode,
            stage: data.stage,
            photoSubmittedAt: data.photoSubmittedAt ?? prev.photoSubmittedAt,
          }));
        }
      } catch {
        // Stage already persisted locally
      }
    },
    []
  );

  const handlePhotoVerificationComplete = useCallback(() => {
    setStep('photo_success');
  }, []);

  const handlePhotoSuccessContinue = useCallback(() => {
    // Discard transient in-memory photo preview once moving to account verification
    setTransientPhotoPreview(undefined);
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
            durationMs={2000}
            onComplete={handleInitialComplete}
            actionLabel="Continuar"
          />
        )}

        {step === 'hub' && (
          <VerificationHub
            protocolCode={session.protocolCode}
            cpfVerified={session.stage === 'cpf_verified'}
            onStartVerification={handleStartVerification}
            onReplayInitialLoading={handleReplayInitialLoading}
          />
        )}

        {step === 'cpf_entry' && (
          <CpfVerificationStep
            protocolCode={session.protocolCode}
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
            durationMs={1500}
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
            subtitle="Aguarde enquanto validamos sua fotografia. Esta verificação leva no máximo 1 minuto."
            protocolCode={session.protocolCode}
            stages={PHOTO_VERIFICATION_STAGES}
            durationMs={12000}
            timeLimitNote="Máx. 1 min"
            photoPreviewUrl={transientPhotoPreview}
            onComplete={handlePhotoVerificationComplete}
          />
        )}

        {step === 'photo_success' && (
          <PhotoSuccessStep
            protocolCode={session.protocolCode}
            photoPreviewUrl={transientPhotoPreview}
            onContinue={handlePhotoSuccessContinue}
          />
        )}

        {step === 'account_verification' && (
          <AccountVerificationWaiting
            session={session}
            onRefreshStatus={handleRefreshWaitingStatus}
          />
        )}
      </main>
    </div>
  );
}
