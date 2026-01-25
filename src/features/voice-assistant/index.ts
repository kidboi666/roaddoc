export { transcribeAudio } from './api/transcribe';
export { generateAnswer, isFollowUpCommand } from './api/generateAnswer';

export type { VoiceStatus, VoiceConfig } from './config';
export { initVoiceConfig, getVoiceConfig, DEFAULT_VOICE_CONFIG } from './config';

export type { Message } from './model/voiceStore';
export {
  useVoiceStore,
  useVoiceState,
  useVoiceMessages,
  usePreviousContext,
  useVoiceActions,
} from './model/voiceStore';
export { useAudioRecorder, getAudioFileExtension, getAudioMimeType } from './model/useAudioRecorder';
export { useTTS } from './model/useTTS';
export { useVoiceAssistant } from './model/useVoiceAssistant';
export * from './model/haptics';

export { VoiceButton } from './ui/VoiceButton';
export { StatusDisplay } from './ui/StatusDisplay';
