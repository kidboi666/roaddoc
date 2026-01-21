import { Platform, Linking } from 'react-native';

export const SHORTCUT_CONFIG = {
  activityType: 'com.logmind.roaddoc.start-recording',
  title: '로드닥 질문하기',
  suggestedInvocationPhrase: '로드닥',
  deepLinkUrl: 'roaddoc://start-recording',
};

export async function openShortcutsApp(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  const shortcutsUrl = 'shortcuts://';

  try {
    const canOpen = await Linking.canOpenURL(shortcutsUrl);
    if (canOpen) {
      await Linking.openURL(shortcutsUrl);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getShortcutSetupInstructions(): string[] {
  return [
    '1. iOS "단축어" 앱을 엽니다',
    '2. 오른쪽 상단 "+" 버튼을 탭합니다',
    '3. "동작 추가" > "웹" > "URL 열기"를 선택합니다',
    `4. URL에 "${SHORTCUT_CONFIG.deepLinkUrl}"을 입력합니다`,
    '5. 상단의 단축어 이름을 "로드닥"으로 변경합니다',
    '6. "완료"를 탭하여 저장합니다',
    '7. 이제 "Hey Siri, 로드닥"으로 실행할 수 있습니다',
  ];
}

export function isIOSPlatform(): boolean {
  return Platform.OS === 'ios';
}

export function isAndroidPlatform(): boolean {
  return Platform.OS === 'android';
}
