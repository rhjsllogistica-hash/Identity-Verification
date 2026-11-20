import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  FlipHorizontal2,
  ImagePlus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';

interface MobileCameraCaptureProps {
  protocolCode: string;
  onPhotoConfirmed: (photoUrl: string, source: 'camera' | 'upload' | 'assisted') => void;
  onCancel: () => void;
}

type CameraState = 'requesting' | 'active' | 'unavailable';

export const MobileCameraCapture: React.FC<MobileCameraCaptureProps> = ({
  protocolCode,
  onPhotoConfirmed,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>('requesting');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [captureSource, setCaptureSource] = useState<'camera' | 'upload' | 'assisted'>('camera');
  const [errorReason, setErrorReason] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      stopStream();
      setCameraState('requesting');
      setErrorReason('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState('unavailable');
        setErrorReason(
          'Seu navegador não disponibilizou acesso direto à câmera neste ambiente.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1080 },
            height: { ideal: 1440 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCameraState('active');
      } catch {
        setCameraState('unavailable');
        setErrorReason(
          'Permissão de câmera não concedida ou nenhuma câmera detectada neste dispositivo.'
        );
      }
    },
    [stopStream]
  );

  useEffect(() => {
    if (!capturedPhoto) {
      startCamera(facingMode);
    }
    return () => {
      stopStream();
    };
  }, [facingMode, capturedPhoto, startCamera, stopStream]);

  const handleTakePhoto = () => {
    if (cameraState === 'active' && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 720;
      const height = video.videoHeight || 960;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);
        setCaptureSource('camera');
        stopStream();
      }
    }
  };

  const handleAssistedCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clean studio gradient capture placeholder when hardware webcam is absent
    const grad = ctx.createLinearGradient(0, 0, 0, 960);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 960);

    // Soft studio rim light
    const radial = ctx.createRadialGradient(360, 360, 40, 360, 360, 300);
    radial.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    radial.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 720, 960);

    // Biometric portrait silhouette
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(360, 340, 96, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(360, 620, 175, 190, 0, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    // Subtle capture stamp
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.font = '500 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Protocolo ${protocolCode}`, 360, 860);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    setCaptureSource('assisted');
    stopStream();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedPhoto(reader.result);
        setCaptureSource('upload');
        stopStream();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onPhotoConfirmed(capturedPhoto, captureSource);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-6xl items-center justify-center px-0 py-0 sm:px-6 sm:py-8 lg:px-8">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Mobile Phone Screen Viewport */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center lg:col-span-7"
        >
          <div className="relative flex h-[calc(100dvh-64px)] w-full flex-col overflow-hidden bg-slate-950 text-white sm:h-[700px] sm:max-w-[376px] sm:rounded-[2.75rem] sm:border-[10px] sm:border-slate-900 sm:shadow-2xl">
            {/* Simulated Mobile Status Bar */}
            <div className="relative z-20 flex items-center justify-between px-6 pb-2 pt-3 text-xs font-medium text-white/90">
              <span className="font-mono-tabular">{currentTime}</span>
              <div
                aria-hidden="true"
                className="hidden h-5 w-24 rounded-full bg-black sm:block"
              />
              <span className="text-[11px] text-slate-300">Câmera Segura</span>
            </div>

            {/* Mobile Top Camera Controls */}
            <div className="relative z-20 flex items-center justify-between px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onCancel();
                }}
                aria-label="Fechar câmera"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-sm hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <p className="text-xs font-semibold tracking-tight text-white">
                Reconhecimento facial
              </p>

              <button
                type="button"
                onClick={() =>
                  setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                }
                aria-label="Alternar câmera frontal ou traseira"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-sm hover:bg-slate-800 transition-colors"
              >
                <FlipHorizontal2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Camera Viewfinder / Captured Photo Preview */}
            <div className="relative flex-1 overflow-hidden bg-slate-900">
              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Pré-visualização da foto tirada"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className={`h-full w-full object-cover ${
                      facingMode === 'user' ? '-scale-x-100' : ''
                    } ${cameraState === 'active' ? 'opacity-100' : 'opacity-0'}`}
                  />

                  {cameraState === 'active' && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6"
                    >
                      <svg
                        viewBox="0 0 260 340"
                        className="h-64 w-52 drop-shadow-sm sm:h-72 sm:w-56"
                        fill="none"
                      >
                        <ellipse
                          cx="130"
                          cy="170"
                          rx="105"
                          ry="142"
                          stroke="rgba(255,255,255,0.85)"
                          strokeWidth="2.5"
                          strokeDasharray="8 6"
                        />
                      </svg>
                      <p className="mt-3 rounded-lg bg-slate-950/70 px-3 py-1.5 text-center text-xs font-medium text-white backdrop-blur-sm">
                        Centralize seu rosto dentro da marcação
                      </p>
                    </div>
                  )}

                  {cameraState === 'requesting' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                      <Camera
                        className="h-10 w-10 text-blue-400"
                        aria-hidden="true"
                      />
                      <p className="mt-4 text-sm font-semibold text-white">
                        Abrindo câmera do celular...
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                        Confirme a permissão de câmera caso apareça uma solicitação
                        no topo da tela.
                      </p>
                    </div>
                  )}

                  {cameraState === 'unavailable' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 px-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-blue-400">
                        <Smartphone className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h2 className="font-display mt-4 text-base font-semibold text-white">
                        Câmera direta indisponível
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">
                        {errorReason}
                      </p>

                      <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          <ImagePlus className="h-4 w-4" aria-hidden="true" />
                          <span>Tirar ou escolher foto do aparelho</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAssistedCapture}
                          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          <Camera className="h-4 w-4" aria-hidden="true" />
                          <span>Realizar captura de demonstração</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => startCamera(facingMode)}
                          className="mt-1 min-h-[40px] text-xs font-medium text-slate-400 hover:text-white transition-colors"
                        >
                          Tentar abrir câmera novamente
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Mobile Thumb Zone Controls */}
            <div className="relative z-20 border-t border-slate-800 bg-slate-950 px-5 pb-6 pt-4">
              {capturedPhoto ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Tirar outra</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Enviar foto</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Selecionar foto do dispositivo"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      cameraState === 'active'
                        ? handleTakePhoto
                        : handleAssistedCapture
                    }
                    aria-label="Tirar foto"
                    className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 bg-white p-1 shadow-lg active:scale-95 transition-transform"
                  >
                    <span className="h-full w-full rounded-full bg-blue-600" />
                  </button>

                  <div className="w-12 text-right">
                    <span className="text-[11px] font-medium text-slate-400">
                      Foto
                    </span>
                  </div>
                </div>
              )}

              <div
                aria-hidden="true"
                className="mx-auto mt-4 hidden h-1 w-28 rounded-full bg-slate-700 sm:block"
              />
            </div>
          </div>
        </motion.div>

        {/* Desktop Side Instructions Panel */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-xs font-medium text-slate-500">
              Tela do dispositivo · Protocolo{' '}
              <span className="font-mono-tabular text-slate-700">
                {protocolCode}
              </span>
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Tire sua foto para confirmar o recebimento
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              O visor ao lado simula exatamente a tela de captura móvel para o
              recebedor registrar uma fotografia nítida do rosto.
            </p>

            <ol className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
              <li className="py-3.5">
                <p className="text-sm font-semibold text-slate-900">
                  01. Posicione o rosto na moldura
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Mantenha o rosto centralizado na área oval iluminada e olhe para
                  a câmera.
                </p>
              </li>
              <li className="py-3.5">
                <p className="text-sm font-semibold text-slate-900">
                  02. Toque no botão circular para capturar
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Você poderá conferir a foto antes de confirmar o envio para o
                  sistema.
                </p>
              </li>
              <li className="py-3.5">
                <p className="text-sm font-semibold text-slate-900">
                  03. Aguarde o carregamento de verificação
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Logo após enviar, o processo de análise será exibido até a
                  liberação final.
                </p>
              </li>
            </ol>

            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
              <span>
                Caso esteja sem câmera conectada, utilize o ícone de galeria ou a
                captura assistida no visor.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
