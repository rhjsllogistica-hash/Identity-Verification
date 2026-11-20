import React, { useEffect, useRef, useState } from 'react';
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
  timeLimitNote?: string;
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
  timeLimitNote,
}) => {
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setProgress(0);
    setCompletedCount(0);
    setElapsedSeconds(0);

    const startTime = Date.now();
    let finished = false;
    let completeTimer: number | null = null;

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - ratio, 1.8);
      const pct = Math.min(100, Math.round(eased * 100));

      setProgress(pct);
      setElapsedSeconds(Math.floor(elapsed / 1000));

      const stageProgress = Math.min(
        stages.length,
        Math.floor(ratio * stages.length + 0.1)
      );
      setCompletedCount(stageProgress);

      if (ratio >= 1 && !finished) {
        finished = true;
        window.clearInterval(intervalId);
        setProgress(100);
        setCompletedCount(stages.length);
        completeTimer = window.setTimeout(() => {
          onCompleteRef.current();
        }, 350);
      }
    }, 80);

    return () => {
      window.clearInterval(intervalId);
      if (completeTimer !== null) {
        window.clearTimeout(completeTimer);
      }
    };
  }, [durationMs, stages.length]);

  const formattedElapsed = `00:${String(elapsedSeconds).padStart(2, '0')}`;

  return (
    <section
      aria-live="polite"
      className="mx-auto flex min-h-[calc(100dvh-56px)] w-full max-w-4xl items-center justify-center px-4 py-8 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Protocolo{' '}
                <span className="font-mono-tabular text-slate-700">{protocolCode}</span>
                {timeLimitNote && (
                  <>
                    <span aria-hidden="true" className="mx-1.5">
                      ·
                    </span>
                    <span>{timeLimitNote}</span>
                  </>
                )}
              </p>
              <h1 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
                {title}
              </h1>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono-tabular block text-lg font-semibold text-blue-700">
              {progress}%
            </span>
            <span className="font-mono-tabular block text-[11px] text-slate-400">
              {formattedElapsed}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{subtitle}</p>

        {photoPreviewUrl && (
          <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-900">
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
                Verificando fotografia do recebedor
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Conferindo nitidez, iluminação e reconhecimento facial. O resultado
                aparecerá em instantes.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
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

        <ol className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
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
                  {isDone ? 'Concluído' : isActive ? 'Verificando' : 'Aguardando'}
                </span>
              </li>
            );
          })}
        </ol>

        {actionLabel && (
          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onCompleteRef.current()}
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
