import React, { useState } from 'react';
import {
  Camera,
  Check,
  ChevronDown,
  Clock,
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
  onStartVerification: () => void;
  onReplayInitialLoading: () => void;
}

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Por que o reconhecimento do recebedor é necessário?',
    answer:
      'A confirmação facial garante que apenas o titular autorizado conclua o procedimento antes da liberação do crédito, protegendo a operação contra acessos indevidos.',
  },
  {
    id: 'faq-2',
    question: 'Quanto tempo leva para liberar após tirar a foto?',
    answer:
      'O envio e a leitura da fotografia levam cerca de 30 segundos. Assim que a etapa de carregamento é finalizada, o comprovante de verificação fica disponível imediatamente.',
  },
  {
    id: 'faq-3',
    question: 'O que acontece se a câmera não abrir automaticamente?',
    answer:
      'Você pode autorizar a permissão de câmera nas configurações do navegador ou selecionar diretamente uma fotografia pela opção alternativa exibida na tela do celular.',
  },
];

export const VerificationHub: React.FC<VerificationHubProps> = ({
  protocolCode,
  onStartVerification,
  onReplayInitialLoading,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string>('faq-1');

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      {/* Main Split Hero */}
      <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-between lg:col-span-7"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">
              Protocolo{' '}
              <span className="font-mono-tabular font-semibold text-slate-700">
                {protocolCode}
              </span>
              <span aria-hidden="true" className="mx-2">
                ·
              </span>
              <span>Etapa pendente de confirmação</span>
            </p>

            <h1 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] [text-wrap:balance]">
              Reconhecimento de recebedor
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Sua liberação de crédito está quase pronta, aguardando o procedimento
              processo de liberação.
            </p>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
              Para concluir com segurança, realize uma captura rápida pelo visor do
              celular. O processo leva menos de um minuto e valida o titular em
              tempo real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStartVerification}
                className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 active:scale-[0.99] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:text-base"
              >
                <Camera className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Faça verificação do recebedor para liberação</span>
              </button>

              <button
                type="button"
                onClick={onReplayInitialLoading}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Rever carregamento inicial</span>
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Tempo estimado</p>
              <p className="font-mono-tabular mt-1 text-base font-semibold text-slate-900">
                ~30 segundos
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Método de validação</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                Foto pelo celular
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status atual</p>
              <p className="mt-1 text-base font-semibold text-amber-700">
                Aguardando foto
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Single-elevation process panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-5"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Andamento da liberação
              </h2>
              <span className="font-mono-tabular text-xs font-medium text-slate-500">
                Etapa 2 de 3
              </span>
            </div>

            <ol className="mt-5 divide-y divide-slate-100">
              <li className="flex items-start gap-3.5 pb-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      01. Análise preliminar
                    </p>
                    <span className="text-xs font-medium text-emerald-700">
                      Concluído
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Cadastro conferido e crédito pré-aprovado para liberação.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 py-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      02. Verificação do recebedor
                    </p>
                    <span className="text-xs font-medium text-amber-700">
                      Pendente
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Captura facial direta pela tela do celular para confirmar o
                    recebedor autorizado.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 pt-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-500">
                  3
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-500">
                      03. Liberação do crédito
                    </p>
                    <span className="text-xs text-slate-400">Próxima etapa</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Disponibilização automática após validação da fotografia.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <Lock className="h-4 w-4 shrink-0 text-slate-700" aria-hidden="true" />
              <span>
                Conexão criptografada de ponta a ponta para envio da imagem.
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section: Etapas do procedimento */}
      <section id="etapas" className="mt-16 border-t border-slate-200 pt-12 sm:mt-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Como funciona o procedimento
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Todo o fluxo acontece na própria tela, sem necessidade de instalar
            aplicativos adicionais.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-t border-slate-300 pt-5">
            <span className="font-mono-tabular text-xs font-semibold text-blue-700">
              01. Preparação
            </span>
            <h3 className="font-display mt-2 text-base font-semibold text-slate-900">
              Carregamento seguro
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Ao clicar no botão de verificação, o sistema prepara o ambiente e
              inicializa o visor da câmera do dispositivo.
            </p>
          </div>

          <div className="border-t border-slate-300 pt-5">
            <span className="font-mono-tabular text-xs font-semibold text-blue-700">
              02. Captura móvel
            </span>
            <h3 className="font-display mt-2 text-base font-semibold text-slate-900">
              Fotografia na tela do celular
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Posicione o rosto dentro da guia oval exibida no visor do celular e
              toque em tirar foto para registrar a imagem.
            </p>
          </div>

          <div className="border-t border-slate-300 pt-5">
            <span className="font-mono-tabular text-xs font-semibold text-blue-700">
              03. Processamento
            </span>
            <h3 className="font-display mt-2 text-base font-semibold text-slate-900">
              Leitura e confirmação
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Após o envio da foto, o sistema executa o carregamento de conferência
              para liberar o crédito com segurança.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Requisitos */}
      <section
        id="requisitos"
        className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Requisitos para a foto
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Siga estas orientações rápidas para evitar que a validação precise
              ser repetida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                <Sun className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Boa iluminação frontal
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Prefira locais bem iluminados, evitando luz forte diretamente atrás
                  da sua cabeça.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                <UserCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Rosto livre e centralizado
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Retire óculos escuros, bonés ou máscaras antes de alinhar o rosto
                  na guia da tela.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                <Smartphone className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Aparelho estável
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Segure o dispositivo na altura dos olhos para garantir nitidez no
                  momento da captura.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Permissão da câmera
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Aceite a solicitação de acesso à câmera quando o navegador exibir
                  o pedido na tela.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Privacidade & Ajuda */}
      <section
        id="privacidade"
        className="mt-16 grid grid-cols-1 gap-10 border-t border-slate-200 pt-12 lg:grid-cols-12"
      >
        <div className="lg:col-span-5">
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
            Privacidade e proteção de dados
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            As imagens capturadas neste portal são utilizadas exclusivamente para a
            conferência da identidade do recebedor durante o processo de liberação
            de crédito.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Nenhuma fotografia é compartilhada com terceiros fora do fluxo de
            auditoria de segurança da sua solicitação.
          </p>
        </div>

        <div id="ajuda" className="lg:col-span-7">
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900">
            Perguntas frequentes
          </h2>
          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? '' : item.id)}
                    className="flex min-h-[52px] w-full items-center justify-between gap-4 py-3.5 text-left text-sm font-semibold text-slate-900 hover:text-blue-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-4 text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
