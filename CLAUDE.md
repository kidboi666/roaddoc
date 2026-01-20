# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RoadDoc (로드닥) is a voice-based Korean traffic law Q&A mobile app. Users ask questions via voice while driving, and the app responds with AI-generated answers through TTS.

**Core Flow:** Voice Recording → Whisper API (STT) → GPT-4o-mini → TTS Playback

## Development Commands

```bash
npm install          # Install dependencies
npx expo start       # Start development server
npm run ios          # Start on iOS simulator
npm run android      # Start on Android emulator
npm run lint         # Run ESLint
npm run reset-project # Move starter code to app-example, create blank app
```

## Architecture

### Target Structure (from spec)
```
app/                    # Expo Router file-based routing
├── _layout.tsx         # Root layout
├── index.tsx           # Home (main voice interface)
├── onboarding.tsx      # First-time user flow
└── settings.tsx        # User preferences

src/
├── features/
│   └── voice-assistant/
│       ├── ui/         # VoiceButton, ResponseCard
│       ├── model/      # useAudioRecorder, useTTS, voiceStore (Zustand)
│       └── api/        # transcribe.ts (Whisper), generateAnswer.ts (GPT)
├── shared/
│   ├── api/            # OpenAI client config
│   ├── config/         # prompts.ts, constants.ts
│   ├── hooks/          # useSettings
│   └── sounds/         # Sound effect utilities
```

### Key Technical Decisions
- **STT:** OpenAI Whisper API (not on-device)
- **AI:** GPT-4o-mini with temperature 0.3, max 150 tokens (300 for detailed answers)
- **TTS:** expo-speech (device native TTS)
- **Audio Recording:** expo-audio with platform-specific formats (iOS: m4a, Android: webm)
- **State:** Zustand for voice state management (idle/recording/processing/speaking)
- **Silence Detection:** 1.5 seconds default, triggers auto-stop

### Voice Button States
| State | Color | Animation |
|-------|-------|-----------|
| idle | gray | none |
| recording | red | pulse |
| processing | blue | spinner |
| speaking | green | wave |

## Environment Variables

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-xxxx
```

## Git Convention

### Branch Strategy
- GitHub Flow with feature branches
- Format: `{type}/{branch-name}`
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`

### Commit Message
- 한 줄로 작성 (하단 리스트업 금지)
- 첫 글자 대문자
- Format: `{Type}: 설명`
- AI 작업 정보 (Co-authored-by 등) 포함 금지
- 예시: `Feat: 음성 녹음 기능 구현`, `Fix: TTS 재생 오류 수정`

## Code Convention

- 코드에 주석 작성 금지 (self-documenting code 지향)
- 변수명, 함수명으로 의도를 명확하게 표현

## Important Specs

- Refer to `docs/roaddoc-spec.md` for complete MVP specifications
- Korean language only (ko-KR)
- 3-sentence answers by default, detailed on "더 자세히" command
- Natural language command processing (GPT handles intent parsing)
- 3 automatic retries on API failures
- Dark mode follows system settings