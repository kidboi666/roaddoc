import { Platform, View } from 'react-native';
import {
  BannerAd as GoogleBannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-2882120764375432/6074446884',
      android: 'ca-app-pub-2882120764375432/3088534356',
    }) ?? TestIds.BANNER;

export function BannerAd() {
  return (
    <View className="items-center">
      <GoogleBannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}
