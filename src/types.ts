export type VerificationStep =
  | 'initial_loading'
  | 'hub'
  | 'camera_loading'
  | 'camera_capture'
  | 'analyzing'
  | 'completed';

export interface VerificationSession {
  protocolCode: string;
  startedAt: string;
  completedAt?: string;
  capturedPhotoUrl?: string;
  captureSource?: 'camera' | 'upload' | 'assisted';
}
