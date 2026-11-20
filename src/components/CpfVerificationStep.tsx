import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Camera, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cleanCpfDigits, formatCpf, isValidCpf, maskCpf } from '../utils/cpf';

interface CpfVerificationStepProps {
  protocolCode: string;
  existingMaskedCpf?: string;
  onCpfVerified: (rawCpf: string, maskedCpf: string, serverData?: { protocolCode?: string; cpfVerifiedAt?: string }) => void;
  onCancel: () => void;
}

export const CpfVerificationStep: React.FC<CpfVerificationStepProps> = ({
  protocolCode,
  existingMaskedCpf,
  onCpfVerified,
  onCancel,
}) => {
  const [cpfInput, setCpfInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [phase, setPhase] = useState<'input' | 'validating' | 'identified'>('input');
  const [identifiedMaskedCpf, setIdentifiedMaskedCpf] = useState(existingMaskedCpf ?? '');
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const lastSubmittedDigitsRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const submitValidCpf = async (digits: string) => {
    if (phase !== 'input') return;
    if (lastSubmittedDigitsRef.current === digits) return;
    lastSubmittedDigitsRef.current = digits;

    setErrorMsg('');
    setPhase('validating');

    let serverProtocol = protocolCode;
    let serverVerifiedAt: string | undefined;
    let serverMasked = maskCpf(digits);

    try {
      const response = await fetch('/api/session/cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: digits }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        if (response.status === 400) {
          const errPayload = (await response.json().catch(() => ({}))) as { error?: string };
          setPhase('input');
          lastSubmittedDigitsRef.current = '';
          setErrorMsg(
            errPayload.error || 'CPF inválido. Verifique os dígitos e tente novamente.'
          );
          return;
        }

        if (response.ok) {
          const payload = (await response.json()) as {
            protocolCode?: string;
            maskedCpf?: string;
            cpfVerifiedAt?: string;
          };
          if (payload.protocolCode) serverProtocol = payload.protocolCode;
          if (payload.maskedCpf) serverMasked = payload.maskedCpf;
          if (payload.cpfVerifiedAt) serverVerifiedAt = payload.cpfVerifiedAt;
        }
      }
    } catch {
      // Proceed with local validated fallback if API is unreachable
    }

    setIdentifiedMaskedCpf(serverMasked);
    setPhase('identified');

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      onCpfVerified(digits, serverMasked, {
        protocolCode: serverProtocol,
        cpfVerifiedAt: serverVerifiedAt,
      });
    }, 1800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = cleanCpfDigits(raw);
    const formatted = formatCpf(digits);
    setCpfInput(formatted);

    if (digits.length < 11) {
      setErrorMsg('');
      lastSubmittedDigitsRef.current = '';
      return;
    }

    if (digits.length === 11) {
      if (isValidCpf(digits)) {
        setErrorMsg('');
        void submitValidCpf(digits);
      } else {
        setErrorMsg('CPF inválido. Informe um número de CPF válido para prosseguir.');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanCpfDigits(cpfInput);

    if (digits.length !== 11 || !isValidCpf(digits)) {
      setErrorMsg('CPF inválido. Digite os 11 números de um CPF válido.');
      return;
    }

    void submitValidCpf(digits);
  };

  const handleProceedNow = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    const digits = cleanCpfDigits(cpfInput);
    onCpfVerified(digits, identifiedMaskedCpf || maskCpf(digits));
  };

  const digitsCount = cleanCpfDigits(cpfInput).length;
  const isCurrentlyValid = digitsCount === 11 && isValidCpf(cpfInput);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
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
                Etapa 1 de 3 · Protocolo{' '}
                <span className="font-mono-tabular text-slate-700">{protocolCode}</span>
              </p>
              <h1 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
                Identificação por CPF
              </h1>
            </div>
          </div>
        </div>

        {phase === 'identified' ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3.5">
                <CheckCircle2
                  className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-emerald-950">
                    CPF identificado com sucesso ({identifiedMaskedCpf})
                  </p>
                  <p className="font-display mt-2 text-lg font-bold text-slate-900">
                    Agora sim: processo de reconhecimento facial
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                    Cadastro localizado. Estamos abrindo a tela do celular para você
                    tirar a foto e dar continuidade ao reconhecimento da conta
                    recebedor.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin text-blue-700" aria-hidden="true" />
                <span>Iniciando etapa facial automaticamente...</span>
              </div>
              <button
                type="button"
                onClick={handleProceedNow}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Abrir câmera agora</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} noValidate className="mt-6">
            <p className="text-sm leading-relaxed text-slate-600">
              Antes de iniciar a captura da foto, informe seu CPF. O sistema valida
              os dígitos automaticamente e libera o processo facial assim que o
              documento for identificado.
            </p>

            <div className="mt-6">
              <label
                htmlFor="cpf-input"
                className="block text-sm font-semibold text-slate-900"
              >
                Número do CPF do recebedor
              </label>
              <div className="relative mt-2">
                <input
                  id="cpf-input"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  placeholder="000.000.000-00"
                  value={cpfInput}
                  onChange={handleInputChange}
                  disabled={phase === 'validating'}
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? 'cpf-error' : 'cpf-hint'}
                  className={`font-mono-tabular block min-h-[52px] w-full rounded-xl border bg-white px-4 py-3 text-lg tracking-wide text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errorMsg
                      ? 'border-red-400 focus:border-red-600 focus:ring-red-600/20'
                      : isCurrentlyValid
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/20'
                      : 'border-slate-300 focus:border-blue-700 focus:ring-blue-700/20'
                  }`}
                />
                {phase === 'validating' && (
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <Loader2
                      className="h-5 w-5 animate-spin text-blue-700"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              {errorMsg ? (
                <p
                  id="cpf-error"
                  role="alert"
                  className="mt-2.5 flex items-center gap-2 text-xs font-medium text-red-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </p>
              ) : (
                <p id="cpf-hint" className="mt-2.5 text-xs text-slate-500">
                  Digite os 11 dígitos de um CPF válido para identificação automática.
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Voltar
              </button>

              <button
                type="submit"
                disabled={phase === 'validating' || !isCurrentlyValid}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 transition-colors"
              >
                {phase === 'validating' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Identificando CPF...</span>
                  </>
                ) : (
                  <>
                    <span>Validar e ir para o facial</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
};
