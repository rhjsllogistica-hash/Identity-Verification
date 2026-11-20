import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { VerificationSession } from '../types';

interface AccountVerificationWaitingProps {
  session: VerificationSession;
  onRefreshStatus: () => Promise<void>;
}

const WAITING_STATUS_MESSAGES = [
  'Gerando código de liberação...',
  'Aguardando confirmação da conta do recebedor...',
  'Gerando código de liberação para conclusão do crédito...',
  'Processando validação final da conta do recebedor...',
];

export const AccountVerificationWaiting: React.FC<
  AccountVerificationWaitingProps
> = ({ session, onRefreshStatus }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [barProgress, setBarProgress] = useState(42);
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
      setMessageIndex((prev) => (prev + 1) % WAITING_STATUS_MESSAGES.length);
    }, 3200);

    const barInterval = window.setInterval(() => {
      setBarProgress((prev) => (prev >= 88 ? 36 : prev + 4));
    }, 900);

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
      className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-5xl items-center justify-center px-4 py-8 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Etapa final · Protocolo{' '}
                <span className="font-mono-tabular font-semibold text-slate-700">
                  {session.protocolCode}
                </span>
              </p>
              <h1 className="font-display mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Verificação de conta do recebedor
              </h1>
            </div>
          </div>

          <span className="font-mono-tabular text-xs font-semibold text-amber-700 whitespace-nowrap shrink-0">
            Aguardando liberação
          </span>
        </div>

        <p className="mt-4 text-sm font-medium text-slate-800 sm:text-base">
          Está faltando pouco para realizar sua liberação de crédito.
        </p>

        {/* Continuous Running / Generating Release Code Box */}
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Loader2
                className="h-5 w-5 shrink-0 animate-spin text-blue-700"
                aria-hidden="true"
              />
              <div>
                <p className="font-display text-sm font-bold text-slate-900 sm:text-base">
                  Aguardando validação da conta do recebedor
                </p>
                <p className="mt-0.5 text-xs text-slate-700">
                  {WAITING_STATUS_MESSAGES[messageIndex]}
                </p>
              </div>
            </div>
            <span className="font-mono-tabular hidden text-xs font-medium text-blue-800 sm:inline">
              Processando
            </span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-700 transition-transform duration-700 ease-out"
              style={{
                width: '100%',
                transform: `translateX(-${100 - barProgress}%)`,
              }}
            />
          </div>
        </div>

        {/* Verified photo notice */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 sm:text-sm">
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-emerald-700"
            aria-hidden="true"
          />
          <span>
            <strong>Foto verificada com sucesso.</strong> O sistema está
            concluindo a verificação de conta do recebedor.
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Andamento das etapas
            </h2>
            <ol className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              <li className="flex items-start justify-between gap-3 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      01. CPF validado
                    </p>
                    <p className="font-mono-tabular text-xs text-slate-500">
                      {session.cpfVerifiedAt || 'Identificação confirmada'}
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
                      02. Foto facial verificada
                    </p>
                    <p className="font-mono-tabular text-xs text-slate-500">
                      {session.photoSubmittedAt || 'Aprovada no sistema'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-700">
                  Sucesso
                </span>
              </li>

              <li className="flex items-start justify-between gap-3 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      03. Verificação de conta do recebedor
                    </p>
                    <p className="text-xs text-slate-600">
                      Gerando código de liberação e aguardando confirmação
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
            <p className="text-xs font-semibold text-slate-900">
              Resumo do atendimento
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Aguarde o término do processamento para emissão do código de
              liberação da conta.
            </p>

            <dl className="mt-4 space-y-2.5 border-t border-slate-200 pt-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Protocolo</dt>
                <dd className="font-mono-tabular font-semibold text-slate-900">
                  {session.protocolCode}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-blue-700">
                  Gerando código
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Última consulta</dt>
                <dd className="font-mono-tabular font-medium text-slate-800">
                  {lastCheckedTime}
                </dd>
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
            Seu procedimento está em andamento. Caso saia do aplicativo e retorne
            depois, ele continuará exatamente desta etapa de verificação de conta
            do recebedor.
          </span>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 transition-colors sm:w-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Consultando...' : 'Atualizar status'}</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};
