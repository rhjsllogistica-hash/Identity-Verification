export type VerificationStep =
  | 'initial_loading'
  | 'hub'
  | 'cpf_entry'
  | 'camera_loading'
  | 'camera_capture'
  | 'analyzing'
  | 'photo_success'
  | 'account_verification';

export type ServerSessionStage =
  | 'hub'
  | 'cpf_verified'
  | 'account_verification';

export interface VerificationSession {
  protocolCode: string;
  stage: ServerSessionStage;
  startedAt: string;
  cpfVerifiedAt?: string;
  photoSubmittedAt?: string;
}
