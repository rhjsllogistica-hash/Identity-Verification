import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface PhotoSuccessStepProps {
  protocolCode: string;
  maskedCpf?: string;
  photoPreviewUrl?: string;
  onContinue: () => void;
}

export const PhotoSuccessStep: React.FC<PhotoSuccessStepProps> = ({
  protocolCode,
  maskedCpf,
  photoPreviewUrl,
  onContinue,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(4);
  const onContinueRef = useRef(onContinue);

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdown);
          onContinueRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(countdown);
    };
  }, []);

  return (
    <section
      aria-live="polite"
      className="mx-auto flex min-h-[calc(100dvh-56px)] w-full max-w-4xl items-center justify-center px-4 py-8 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8"
      >
        <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-700">
              Sucesso · Protocolo{' '}
              <span className="font-mono-tabular">{protocolCode}</span>
            </p>
            <h1 className="font-display mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Foto verificada com sucesso
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
          Seu reconhecimento facial foi aprovado com sucesso. Agora o sistema vai
          exibir a etapa de <strong>verificação de conta do recebedor</strong>{' '}
          aguardando a liberação.
        </p>

        {photoPreviewUrl && (
          <div className="mt-5 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-emerald-200 bg-slate-900">
              <img
                src={photoPreviewUrl}
                alt="Foto verificada com sucesso"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 text-xs">
              <p className="text-sm font-semibold text-emerald-950">
                Reconhecimento facial aprovado
              </p>
              {maskedCpf && (
                <p className="font-mono-tabular mt-1 text-emerald-800">
                  CPF vinculado: {maskedCpf}
                </p>
              )}
              <p className="mt-1 text-emerald-800">
                Imagem validada e registrada no seu atendimento.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span className="font-mono-tabular">
              Avançando para verificação da conta em {secondsLeft}s...
            </span>
          </div>

          <button
            type="button"
            onClick={() => onContinueRef.current()}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <span>Ver verificação da conta</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};
