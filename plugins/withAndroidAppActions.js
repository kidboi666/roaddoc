const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const ACTIONS_XML = `<?xml version="1.0" encoding="utf-8"?>
<actions>
  <action intentName="actions.intent.OPEN_APP_FEATURE">
    <parameter name="feature">
      <entity-set-reference entitySetId="FeatureEntitySet" />
    </parameter>
    <fulfillment urlTemplate="roaddoc://start-recording" />
  </action>

  <entity-set entitySetId="FeatureEntitySet">
    <entity
      name="질문하기"
      alternateName="@array/startRecordingAlternateNames"
      identifier="start-recording" />
  </entity-set>
</actions>
`;

const ALTERNATE_NAMES_XML = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string-array name="startRecordingAlternateNames">
    <item>로드닥</item>
    <item>도로법 질문</item>
    <item>교통법 질문</item>
  </string-array>
</resources>
`;

function withActionsXml(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const xmlDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml');
      const valuesDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values');

      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      fs.writeFileSync(path.join(xmlDir, 'actions.xml'), ACTIONS_XML);

      if (!fs.existsSync(valuesDir)) {
        fs.mkdirSync(valuesDir, { recursive: true });
      }

      const alternateNamesPath = path.join(valuesDir, 'app_actions_strings.xml');
      fs.writeFileSync(alternateNamesPath, ALTERNATE_NAMES_XML);

      return config;
    },
  ]);
}

function withAppActionsManifest(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (mainApplication) {
      if (!mainApplication['meta-data']) {
        mainApplication['meta-data'] = [];
      }

      const hasActionsMetadata = mainApplication['meta-data'].some(
        (item) => item.$?.['android:name'] === 'com.google.android.actions'
      );

      if (!hasActionsMetadata) {
        mainApplication['meta-data'].push({
          $: {
            'android:name': 'com.google.android.actions',
            'android:resource': '@xml/actions',
          },
        });
      }
    }

    return config;
  });
}

function withAndroidAppActions(config) {
  config = withActionsXml(config);
  config = withAppActionsManifest(config);
  return config;
}

module.exports = withAndroidAppActions;
