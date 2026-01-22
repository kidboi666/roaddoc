# 핸즈프리 음성 질문 기능 스펙

## 1. 배경 및 문제점

### 현재 상태
- 사용자가 앱을 직접 열고 녹음 버튼을 터치해야 기능 동작
- 운전 중 시선 이동 및 손 조작 필요
- 안전하지 않은 UX

### 목표 사용 환경
- 운전 중 블루투스로 차량에 연결된 상태
- 음악 재생 또는 네비게이션 실행 중
- 핸드폰 조작 없이 음성으로만 사용

---

## 2. 솔루션 개요

### 핵심 기능
**음성 비서 연동을 통한 앱 실행 + 자동 녹음 시작**

| 플랫폼 | 트리거 | 기술 |
|--------|--------|------|
| iOS | "Hey Siri, 로드닥" | Siri Shortcuts |
| Android | "Hey Google, 로드닥" | App Actions |

### 공통 플로우
```
음성 비서 호출 → 딥링크로 앱 실행 → 자동 녹음 시작 → 질문 인식 → 답변 TTS
```

---

## 3. 기술 스펙

### 3.1 딥링크 스키마

```
roaddoc://start-recording
roaddoc://start-recording?auto=true
```

**파라미터:**
- `auto=true`: 앱 실행 즉시 녹음 시작 (기본값)

### 3.2 iOS: Siri Shortcuts

**필요 패키지:**
```bash
npx expo install expo-shortcuts
```

**Shortcut 정의:**
| Shortcut 이름 | 호출 문구 예시 | 동작 |
|--------------|---------------|------|
| 로드닥 질문하기 | "로드닥", "도로법 질문" | 앱 실행 + 녹음 시작 |

**구현 파일:**
- `src/shared/lib/shortcuts.ts` - Shortcut 등록/관리
- `app/_layout.tsx` - 딥링크 수신 처리

**Info.plist 추가 (app.json):**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSUserActivityTypes": [
          "com.roaddoc.start-recording"
        ]
      }
    }
  }
}
```

### 3.3 Android: App Actions

**actions.xml (android/app/src/main/res/xml/):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<actions>
  <action intentName="actions.intent.OPEN_APP_FEATURE">
    <parameter name="feature">
      <entity-set-reference entitySetId="FeatureEntitySet" />
    </parameter>
    <fulfillment urlTemplate="roaddoc://start-recording" />
  </action>
</actions>
```

**AndroidManifest.xml 추가:**
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="roaddoc" />
</intent-filter>

<meta-data
  android:name="com.google.android.actions"
  android:resource="@xml/actions" />
```

### 3.4 딥링크 핸들링

**app/_layout.tsx 수정:**
```typescript
import * as Linking from 'expo-linking';

export default function RootLayout() {
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      const { path } = Linking.parse(url);
      if (path === 'start-recording') {
        setAutoStartRecording(true);
      }
    }
  }, [url]);
}
```

**app/index.tsx 수정:**
```typescript
export default function HomeScreen() {
  const { autoStartRecording, clearAutoStart } = useAutoStart();
  const { startListening } = useVoiceAssistant();

  useEffect(() => {
    if (autoStartRecording) {
      startListening();
      clearAutoStart();
    }
  }, [autoStartRecording]);
}
```

---

## 4. 사용자 플로우

### 4.1 iOS 사용자 플로우

```
[최초 설정]
1. 앱 설치 후 온보딩 완료
2. 설정 > Siri Shortcuts 추가 안내 표시
3. "Siri에 추가" 버튼 탭
4. 호출 문구 설정 (기본: "로드닥")

[일상 사용]
1. 운전 중 "Hey Siri, 로드닥" 호출
2. 앱 자동 실행 + "질문하세요" TTS 안내
3. 질문 말하기 (침묵 감지로 자동 종료)
4. 답변 TTS 재생
5. 앱 대기 상태 (추가 질문 가능)
```

### 4.2 Android 사용자 플로우

```
[최초 설정]
1. 앱 설치 후 온보딩 완료
2. Google Assistant에서 자동으로 App Action 인식
   (또는 설정에서 루틴 추가 안내)

[일상 사용]
1. 운전 중 "Hey Google, 로드닥 실행해" 호출
2. 앱 자동 실행 + "질문하세요" TTS 안내
3. 질문 말하기 (침묵 감지로 자동 종료)
4. 답변 TTS 재생
5. 앱 대기 상태 (추가 질문 가능)
```

### 4.3 자동 녹음 시작 시 TTS 안내

딥링크로 실행 시:
```
"네, 질문하세요" (TTS) → 녹음 시작 → 침묵 감지 → 처리
```

---

## 5. 설정 화면 추가

### 5.1 새로운 설정 항목

**위치:** `app/settings.tsx`

```
[음성 설정]
├── TTS 속도 (기존)
├── 침묵 감지 시간 (기존)
└── 음성 비서 연동
    ├── iOS: "Siri에 추가" 버튼
    └── Android: "Google Assistant 설정" 가이드
```

### 5.2 Siri Shortcut 추가 UI (iOS)

```typescript
import { presentShortcut } from 'expo-shortcuts';

const handleAddToSiri = async () => {
  await presentShortcut({
    activityType: 'com.roaddoc.start-recording',
    title: '로드닥 질문하기',
    suggestedInvocationPhrase: '로드닥',
  });
};
```

---

## 6. 구현 순서

### Phase 1: 딥링크 기반 자동 녹음
1. `expo-linking` 딥링크 핸들링 구현
2. 자동 녹음 시작 로직 추가
3. 시작 시 TTS 안내 ("질문하세요") 추가

### Phase 2: iOS Siri Shortcuts
1. `expo-shortcuts` 설치 및 설정
2. Shortcut 등록 로직 구현
3. 설정 화면에 "Siri에 추가" 버튼 추가
4. 온보딩에 Siri 설정 안내 추가

### Phase 3: Android App Actions
1. `actions.xml` 작성
2. AndroidManifest 수정
3. 설정 화면에 Google Assistant 가이드 추가

### Phase 4: 테스트 및 개선
1. iOS 시뮬레이터/실기기 테스트
2. Android 에뮬레이터/실기기 테스트
3. 블루투스 연결 환경 테스트

---

## 7. 수정 대상 파일

| 파일 | 변경 내용 |
|------|----------|
| `app.json` | iOS NSUserActivityTypes, Android intent 설정 |
| `app/_layout.tsx` | 딥링크 수신 및 처리 |
| `app/index.tsx` | 자동 녹음 시작 로직 |
| `app/settings.tsx` | 음성 비서 연동 설정 UI |
| `src/shared/lib/shortcuts.ts` | (신규) Shortcut 관리 유틸 |
| `src/shared/hooks/useAutoStart.ts` | (신규) 자동 시작 상태 관리 |
| `android/app/src/main/res/xml/actions.xml` | (신규) App Actions 정의 |

---

## 8. 검증 방법

### iOS 테스트
1. 앱 빌드 후 실기기 설치
2. 설정 > Siri에 Shortcut 추가
3. "Hey Siri, 로드닥" 호출
4. 앱 실행 + 자동 녹음 확인
5. 질문 후 답변 TTS 확인

### Android 테스트
1. 앱 빌드 후 실기기 설치
2. "Hey Google, 로드닥 실행해" 호출
3. 앱 실행 + 자동 녹음 확인
4. 질문 후 답변 TTS 확인

### 블루투스 환경 테스트
1. 차량 블루투스 연결
2. 음악 재생 중 음성 비서 호출
3. 음악 일시정지 → 앱 실행 → 질문/답변 → 음악 재개 확인

---

## 9. 향후 확장 가능성

- **Wake Word 감지**: 앱 포그라운드에서 "로드닥" 직접 인식
- **백그라운드 오디오**: 앱이 백그라운드에서도 TTS 재생
- **블루투스 미디어 버튼**: 핸들 버튼으로 녹음 트리거
- **CarPlay/Android Auto**: 차량 인포테인먼트 연동
