import React, { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { VerificationSession } from '../types';

interface AccountVerificationWaitingProps {
  session: VerificationSession;
  onRefreshStatus: () => Promise<void>;
  onResetSession: () => Promise<void>;
}

const PROCESSING_MESSAGES = [
  'Consultando dados da conta de recebedor vinculada ao CPF...',
  'Conferindo compatibilidade do reconhecimento facial enviado...',
  'Aguardando validação final do procedimento de liberação...',
  'Mantendo fila de verificação ativa para conclusão do crédito...',
];

export const AccountVerificationWaiting: React.FC<
  AccountVerificationWaitingProps
> = ({ session, onRefreshStatus, onResetSession }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [barProgress, setBarProgress] = useState(38);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>(() =>
    new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );

  useEffect(() => {
    const msgInterval = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 3400);

    const barInterval = window.setInterval(() => {
      setBarProgress((prev) => (prev >= 86 ? 42 : prev + 4));
    }, 1100);

    return () => {
      window.clearInterval(msgInterval);
      window.clearInterval(barInterval);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStatus();
    setLastCheckedTime(
      new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  return (
    <section
      aria-live="polite"
      className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10"
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Etapa em andamento · Protocolo{' '}
                <span className="font-mono-tabular font-semibold text-slate-700">
                  {session.protocolCode}
                </span>
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Verificação conta de recebedor
              </h1>
            </div>
          </div>

          <span className="font-mono-tabular text-xs font-semibold text-amber-700">
            Carregando · Aguardando conclusão
          </span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-700 sm:text-base">
          Seu CPF e sua foto de reconhecimento facial já foram registrados. O
          sistema está executando a verificação da conta do recebedor para liberar
          o crédito.
        </p>

        {/* Continuous Loading Bar */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-4 text-xs font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <Loader2
                className="h-3.5 w-3.5 animate-spin text-blue-700"
                aria-hidden="true"
              />
              <span>{PROCESSING_MESSAGES[messageIndex]}</span>
            </span>
            <span className="font-mono-tabular shrink-0 text-slate-500">
              Atualizado às {lastCheckedTime}
            </span>
          </div>

          <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-700 transition-transform duration-700 ease-out"
              style={{
                width: '100%',
                transform: `translateX(-${100 - barProgress}%)`,
              }}
            />
          </div>
        </div>

        {/* Captured Photo + Checklist Summary */}
        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Etapas do procedimento
            </h2>
            <ol className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              <li className="flex items-start justify-between gap-3 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      01. CPF identificado
                    </p>
                    <p className="font-mono-tabular text-xs text-slate-500">
                      {session.maskedCpf || 'Documento validado'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-700">
                  Concluído
                </span>
              </li>

              <li className="flex items-start justify-between gap-3 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      02. Reconhecimento facial enviado
                    </p>
                    <p className="font-mono-tabular text-xs text-slate-500">
                      {session.photoSubmittedAt || 'Fotografia registrada'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-700">
                  Enviado
                </span>
              </li>

              <li className="flex items-start justify-between gap-3 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      03. Verificação conta de recebedor
                    </p>
                    <p className="text-xs text-slate-600">
                      Carregando e aguardando confirmação final
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-700">
                  Aguardando
                </span>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-5">
            {session.capturedPhotoUrl && (
              <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
                  <img
                    src={session.capturedPhotoUrl}
                    alt="Foto registrada do recebedor"
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="animate-scan-sweep pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">
                    Captura facial registrada
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Em conferência com a conta recebedora
                  </p>
                </div>
              </div>
            )}

            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Protocolo</dt>
                <dd className="font-mono-tabular font-semibold text-slate-900">
                  {session.protocolCode}
                </dd>
              </div>
              {session.ipMasked && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">IP registrado</dt>
                  <dd className="font-mono-tabular font-medium text-slate-800">
                    {session.ipMasked}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Continuidade</dt>
                <dd className="font-medium text-slate-800">Salva por acesso</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 border-t border-slate-100 pt-5 text-xs leading-relaxed text-slate-600">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
            aria-hidden="true"
          />
          <span>
            Sua etapa atual está gravada automaticamente para este IP. Sempre que
            você retornar ao site, continuará diretamente nesta tela de
            verificação da conta de recebedor.
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Consultando...' : 'Atualizar status'}</span>
          </button>

          <button
            type="button"
            onClick={onResetSession}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reiniciar procedimento</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};
