import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import { APP_INFO, DISCLAIMER } from '@/shared/config';
import { useSettings } from '@/shared/hooks';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { setOnboardingCompleted, setDisclaimerAccepted } = useSettings();

  const handleStart = async () => {
    // 마이크 권한 요청
    const result = await requestRecordingPermissionsAsync();
    if (!result.granted) {
      Alert.alert(
        '마이크 권한 필요',
        '음성 질문을 인식하기 위해 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    // 면책 조항 팝업 표시
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = async () => {
    setShowDisclaimer(false);
    await setDisclaimerAccepted(true);
    await setOnboardingCompleted(true);
    // _layout.tsx의 useEffect가 자동으로 홈으로 리다이렉트
  };

  const handleDeclineDisclaimer = () => {
    setShowDisclaimer(false);
    Alert.alert(
      '동의 필요',
      '앱을 사용하시려면 면책 조항에 동의해주세요.',
      [{ text: '확인' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🚗</Text>
        <Text style={styles.title}>{APP_INFO.name}</Text>
        <Text style={styles.slogan}>{APP_INFO.slogan}</Text>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            운전 중 궁금한 도로교통법{'\n'}
            음성으로 물어보세요
          </Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>시작하기</Text>
      </Pressable>

      {/* 면책 조항 모달 */}
      <Modal
        visible={showDisclaimer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>이용 안내</Text>
            <Text style={styles.modalText}>{DISCLAIMER}</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleDeclineDisclaimer}
              >
                <Text style={styles.modalButtonTextSecondary}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAcceptDisclaimer}
              >
                <Text style={styles.modalButtonTextPrimary}>동의</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
      paddingHorizontal: 24,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: isDark ? '#f5f5f5' : '#1a1a1a',
      marginBottom: 8,
    },
    slogan: {
      fontSize: 18,
      color: isDark ? '#a0a0a0' : '#666666',
      marginBottom: 48,
    },
    description: {
      alignItems: 'center',
    },
    descriptionText: {
      fontSize: 16,
      color: isDark ? '#a0a0a0' : '#666666',
      textAlign: 'center',
      lineHeight: 24,
    },
    button: {
      backgroundColor: isDark ? '#333333' : '#1a1a1a',
      paddingVertical: 16,
      borderRadius: 12,
      marginBottom: 32,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#f5f5f5' : '#1a1a1a',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 14,
      color: isDark ? '#a0a0a0' : '#666666',
      lineHeight: 22,
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalButtonSecondary: {
      backgroundColor: isDark ? '#333333' : '#e0e0e0',
    },
    modalButtonPrimary: {
      backgroundColor: isDark ? '#f5f5f5' : '#1a1a1a',
    },
    modalButtonTextSecondary: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#a0a0a0' : '#666666',
    },
    modalButtonTextPrimary: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#1a1a1a' : '#ffffff',
    },
  });
