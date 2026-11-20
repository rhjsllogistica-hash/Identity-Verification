import React, { useState } from 'react';
import {
  Camera,
  Check,
  ChevronRight,
  Clock,
  HelpCircle,
  Home,
  ListChecks,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sun,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationHubProps {
  protocolCode: string;
  maskedCpf?: string;
  ipMasked?: string;
  onStartVerification: () => void;
  onReplayInitialLoading: () => void;
}

type AppTab = 'inicio' | 'requisitos' | 'duvidas';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Por que informar um CPF válido antes da foto?',
    answer:
      'O CPF válido identifica automaticamente seu processo de liberação antes de habilitar a câmera para o reconhecimento facial.',
  },
  {
    id: 'faq-2',
    question: 'O que acontece após enviar a foto?',
    answer:
      'O app grava seu acesso automaticamente e avança para a tela de Verificação conta de recebedor, mantendo o acompanhamento ativo.',
  },
  {
    id: 'faq-3',
    question: 'Se eu sair do app e voltar depois, perco a etapa?',
    answer:
      'Não. Sempre que você entrar novamente pelo mesmo acesso, o app retoma diretamente na etapa em andamento.',
  },
];

export const VerificationHub: React.FC<VerificationHubProps> = ({
  protocolCode,
  maskedCpf,
  ipMasked,
  onStartVerification,
  onReplayInitialLoading,
}) => {
  const [activeTab, setActiveTab] = useState<AppTab>('inicio');
  const hasVerifiedCpf = Boolean(maskedCpf);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-5xl flex-col justify-between px-4 pb-24 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Main App Screen Column */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          {activeTab === 'inicio' && (
            <div className="space-y-4">
              {/* Primary App Status Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {hasVerifiedCpf
                      ? `CPF ${maskedCpf} identificado`
                      : 'Liberação pendente'}
                  </span>
                  <span className="font-mono-tabular font-medium text-amber-700">
                    {hasVerifiedCpf ? 'Etapa 2/3' : 'Etapa 1/3'}
                  </span>
                </div>

                <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
                  Reconhecimento de recebedor
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
                  Sua liberação de crédito está quase pronta, aguardando o
                  procedimento processo de liberação.
                </p>

                <div className="mt-5 hidden sm:block">
                  <button
                    type="button"
                    onClick={onStartVerification}
                    className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 active:scale-[0.99] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <Camera className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>Faça verificação do recebedor para liberação</span>
                  </button>
                </div>
              </div>

              {/* App Interactive Process Checklist */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <h2 className="font-display text-sm font-semibold text-slate-900">
                    Etapas da liberação
                  </h2>
                  <button
                    type="button"
                    onClick={onReplayInitialLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Recarregar</span>
                  </button>
                </div>

                <ol className="divide-y divide-slate-100">
                  <li className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex items-center gap-3">
                      {hasVerifiedCpf ? (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          01. Validar CPF do recebedor
                        </p>
                        <p className="text-xs text-slate-500">
                          {hasVerifiedCpf
                            ? `Identificado (${maskedCpf})`
                            : 'Identificação automática por CPF válido'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </li>

                  <li className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          hasVerifiedCpf
                            ? 'bg-blue-700 text-white'
                            : 'border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-500'
                        }`}
                      >
                        {hasVerifiedCpf ? (
                          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          '2'
                        )}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            hasVerifiedCpf ? 'text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          02. Processo facial pelo celular
                        </p>
                        <p className="text-xs text-slate-500">
                          Foto rápida na câmera do aparelho
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </li>

                  <li className="flex items-center justify-between gap-3 pt-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-500">
                        3
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-600">
                          03. Verificação conta de recebedor
                        </p>
                        <p className="text-xs text-slate-500">
                          Carregamento contínuo após envio da foto
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'requisitos' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Requisitos para a captura
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Prepare o ambiente antes de abrir a câmera do aparelho.
              </p>

              <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
                <div className="flex items-start gap-3.5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Iluminação frontal
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      Escolha um ambiente iluminado e evite luz forte atrás do rosto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Rosto centralizado e sem acessórios
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      Retire óculos escuros ou boné para o reconhecimento facial.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <Smartphone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Autorização de câmera
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      Permita o acesso à câmera quando o navegador solicitar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'duvidas' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Dúvidas frequentes
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Informações sobre CPF, foto facial e continuidade por acesso.
              </p>

              <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
                {FAQ_ITEMS.map((item) => (
                  <div key={item.id} className="py-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.question}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Desktop Companion App Context Panel */}
        <aside className="hidden space-y-4 lg:col-span-5 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Navegação do aplicativo
            </h2>
            <div className="mt-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('inicio')}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === 'inicio'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Início e liberação</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('requisitos')}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === 'requisitos'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ListChecks className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Requisitos da câmera</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('duvidas')}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === 'duvidas'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Dúvidas do processo</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-blue-700" aria-hidden="true" />
              <span>Registro do atendimento</span>
            </div>
            <dl className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Protocolo</dt>
                <dd className="font-mono-tabular font-semibold text-slate-900">
                  {protocolCode}
                </dd>
              </div>
              {ipMasked && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Acesso vinculado</dt>
                  <dd className="font-mono-tabular font-medium text-slate-800">
                    {ipMasked}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Tempo estimado</dt>
                <dd className="font-mono-tabular font-medium text-slate-800">
                  ~30 seg
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Sessão protegida com continuidade automática.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Fixed Thumb-Zone CTA + App Tab Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden">
        {activeTab === 'inicio' && (
          <div className="px-4 pt-3 pb-2">
            <button
              type="button"
              onClick={onStartVerification}
              className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition-transform"
            >
              <Camera className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Faça verificação do recebedor para liberação</span>
            </button>
          </div>
        )}

        <nav
          aria-label="Menu do aplicativo"
          className="grid h-14 grid-cols-3 items-center"
        >
          <button
            type="button"
            onClick={() => setActiveTab('inicio')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              activeTab === 'inicio' ? 'text-blue-700' : 'text-slate-500'
            }`}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            <span>Início</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requisitos')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              activeTab === 'requisitos' ? 'text-blue-700' : 'text-slate-500'
            }`}
          >
            <ListChecks className="h-5 w-5" aria-hidden="true" />
            <span>Requisitos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('duvidas')}
            className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              activeTab === 'duvidas' ? 'text-blue-700' : 'text-slate-500'
            }`}
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
            <span>Dúvidas</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
