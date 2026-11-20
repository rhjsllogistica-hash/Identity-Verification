import React from 'react';
import { CheckCircle2, Download, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { VerificationSession } from '../types';

interface VerificationCompleteProps {
  session: VerificationSession;
  onRestart: () => void;
}

export const VerificationComplete: React.FC<VerificationCompleteProps> = ({
  session,
  onRestart,
}) => {
  const handleDownloadReceipt = () => {
    const content = [
      'IDENTITY VERIFICATION - COMPROVANTE DE PROCEDIMENTO',
      '===================================================',
      `Protocolo: ${session.protocolCode}`,
      `Status: Verificação do recebedor concluída`,
      `Início do atendimento: ${session.startedAt}`,
      `Conclusão da captura: ${session.completedAt ?? new Date().toLocaleString('pt-BR')}`,
      `Situação da liberação: Procedimento validado para liberação de crédito`,
      '===================================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprovante-${session.protocolCode.toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10"
      >
        <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700">
                Procedimento validado · Etapa concluída
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Verificação do recebedor concluída
              </h1>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
          Sua fotografia foi recebida e processada com sucesso. O procedimento de
          reconhecimento foi registrado e sua liberação de crédito seguiu para a
          etapa final.
        </p>

        <div className="mt-7 grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-12 sm:items-center">
          {session.capturedPhotoUrl && (
            <div className="sm:col-span-4">
              <div className="aspect-[3/4] w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 sm:w-full">
                <img
                  src={session.capturedPhotoUrl}
                  alt="Foto confirmada do recebedor"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <dl className="divide-y divide-slate-200 text-sm sm:col-span-8">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Protocolo</dt>
              <dd className="font-mono-tabular font-semibold text-slate-900">
                {session.protocolCode}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Data e hora</dt>
              <dd className="font-mono-tabular font-medium text-slate-900">
                {session.completedAt}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Reconhecimento facial</dt>
              <dd className="font-semibold text-emerald-700">Aprovado</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Status da liberação</dt>
              <dd className="font-semibold text-slate-900">Em processamento final</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
          <span>
            Registro armazenado na sessão atual. Guarde o protocolo para eventual
            acompanhamento.
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Baixar comprovante</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Voltar ao início</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
};
