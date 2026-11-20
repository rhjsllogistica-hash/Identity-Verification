import React, { useEffect, useState } from 'react';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export interface LoadingStageItem {
  id: string;
  label: string;
  detail: string;
}

interface LoadingStageProps {
  title: string;
  subtitle: string;
  protocolCode: string;
  stages: LoadingStageItem[];
  durationMs: number;
  photoPreviewUrl?: string;
  onComplete: () => void;
  actionLabel?: string;
}

export const LoadingStage: React.FC<LoadingStageProps> = ({
  title,
  subtitle,
  protocolCode,
  stages,
  durationMs,
  photoPreviewUrl,
  onComplete,
  actionLabel,
}) => {
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    setProgress(0);
    setCompletedCount(0);

    const startTime = performance.now();
    let frameId = 0;
    let finished = false;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / durationMs, 1);
      // Smooth ease-out curve for natural loading feel
      const eased = 1 - Math.pow(1 - ratio, 2.2);
      const pct = Math.round(eased * 100);

      setProgress(pct);

      const stageProgress = Math.min(
        stages.length,
        Math.floor(ratio * stages.length + 0.12)
      );
      setCompletedCount(stageProgress);

      if (ratio < 1) {
        frameId = requestAnimationFrame(tick);
      } else if (!finished) {
        finished = true;
        setCompletedCount(stages.length);
        setTimeout(() => {
          onComplete();
        }, 320);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [durationMs, stages.length, onComplete]);

  return (
    <section
      aria-live="polite"
      className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Processo em andamento · Protocolo{' '}
                <span className="font-mono-tabular text-slate-700">{protocolCode}</span>
              </p>
              <h1 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
                {title}
              </h1>
            </div>
          </div>
          <span className="font-mono-tabular text-lg font-semibold text-blue-700">
            {progress}%
          </span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-600">{subtitle}</p>

        {photoPreviewUrl && (
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900">
              <img
                src={photoPreviewUrl}
                alt="Fotografia enviada para verificação"
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="animate-scan-sweep pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-blue-400/45 to-transparent"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Imagem capturada para conferência
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Analisando enquadramento, nitidez e dados biométricos do recebedor.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-700 transition-transform duration-150 ease-out"
              style={{
                width: '100%',
                transform: `translateX(-${100 - progress}%)`,
              }}
            />
          </div>
        </div>

        <ol className="mt-7 divide-y divide-slate-100 border-t border-slate-100">
          {stages.map((stage, index) => {
            const isDone = index < completedCount;
            const isActive = index === completedCount && completedCount < stages.length;

            return (
              <li
                key={stage.id}
                className="flex items-start justify-between gap-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {isDone ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                    ) : isActive ? (
                      <Loader2
                        className="h-4 w-4 animate-spin text-blue-700"
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDone
                          ? 'text-slate-900'
                          : isActive
                          ? 'text-blue-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-500">{stage.detail}</p>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                  {isDone ? 'Concluído' : isActive ? 'Processando' : 'Aguardando'}
                </span>
              </li>
            );
          })}
        </ol>

        {actionLabel && (
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onComplete}
              className="min-h-[40px] rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </motion.div>
    </section>
  );
};
