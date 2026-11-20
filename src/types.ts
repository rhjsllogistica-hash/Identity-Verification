export type VerificationStep =
  | 'initial_loading'
  | 'hub'
  | 'cpf_entry'
  | 'camera_loading'
  | 'camera_capture'
  | 'analyzing'
  | 'account_verification';

export type ServerSessionStage =
  | 'hub'
  | 'cpf_verified'
  | 'account_verification';

export interface VerificationSession {
  protocolCode: string;
  ipMasked?: string;
  stage: ServerSessionStage;
  maskedCpf?: string;
  startedAt: string;
  cpfVerifiedAt?: string;
  photoSubmittedAt?: string;
  capturedPhotoUrl?: string;
  captureSource?: 'camera' | 'upload' | 'assisted';
}
