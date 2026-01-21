import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import { APP_INFO, DISCLAIMER } from '@/shared/config';
import { useSettings } from '@/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  ButtonText,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Card,
} from '@/shared/ui';

export default function OnboardingScreen() {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { isDark, setOnboardingCompleted, setDisclaimerAccepted } = useSettings();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, buttonAnim]);

  const handleStart = async () => {
    const result = await requestRecordingPermissionsAsync();
    if (!result.granted) {
      Alert.alert(
        '마이크 권한 필요',
        '음성 질문을 인식하기 위해 마이크 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [{ text: '확인' }]
      );
      return;
    }
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = async () => {
    setShowDisclaimer(false);
    await setDisclaimerAccepted(true);
    await setOnboardingCompleted(true);
    router.replace('/');
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
    <SafeAreaView className="flex-1 bg-background px-6">
      <Animated.View
        className="flex-1 justify-center items-center"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="w-24 h-24 rounded-3xl bg-primary items-center justify-center mb-8 shadow-lg">
          <Text className="text-5xl">🚗</Text>
        </View>

        <Text className="text-4xl font-bold text-foreground mb-2">
          {APP_INFO.name}
        </Text>
        <Text className="text-lg text-muted-foreground mb-16">
          {APP_INFO.slogan}
        </Text>

        <Card variant="filled" size="lg" className="items-center">
          <Text className="text-base text-foreground text-center leading-7">
            운전 중 궁금한 도로교통법{'\n'}
            음성으로 물어보세요
          </Text>
        </Card>
      </Animated.View>

      <Animated.View style={{ opacity: buttonAnim }} className="mb-8">
        <Button
          variant="solid"
          size="lg"
          action="primary"
          onPress={handleStart}
          className="w-full"
        >
          <ButtonText size="lg">시작하기</ButtonText>
        </Button>
      </Animated.View>

      <Modal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        size="md"
        closeOnOverlayClick={false}
      >
        <ModalContent>
          <View
            className="w-12 h-12 rounded-full items-center justify-center self-center mb-4"
            style={{ backgroundColor: isDark ? '#1e3a5f' : '#dbeafe' }}
          >
            <Ionicons name="document-text-outline" size={24} color={isDark ? '#93c5fd' : '#3b82f6'} />
          </View>

          <ModalHeader className="items-center">
            <Heading size="xl">이용 안내</Heading>
          </ModalHeader>

          <ModalBody>
            <Text className="text-sm text-muted-foreground leading-6">
              {DISCLAIMER}
            </Text>
          </ModalBody>

          <ModalFooter className="flex-col gap-3">
            <Button
              variant="solid"
              size="lg"
              action="primary"
              onPress={handleAcceptDisclaimer}
              className="w-full"
            >
              <ButtonText size="md">동의하고 시작하기</ButtonText>
            </Button>
            <Pressable
              className="py-3 items-center active:opacity-70"
              onPress={handleDeclineDisclaimer}
            >
              <Text className="text-base text-muted-foreground">
                취소
              </Text>
            </Pressable>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
