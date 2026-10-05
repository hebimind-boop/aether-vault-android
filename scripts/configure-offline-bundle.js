const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, '../android/app/build.gradle');

console.log('Checking gradle path:', gradlePath);

if (fs.existsSync(gradlePath)) {
  let content = fs.readFileSync(gradlePath, 'utf8');

  // 1. Force JS bundling in debug builds so offline standalone execution works without Metro
  if (!content.includes('bundleInDebug = true')) {
    content = content.replace(
      /react\s*\{/,
      'react {\n    bundleInDebug = true'
    );
    console.log('✔ Added bundleInDebug = true to react {} block');
  }

  // 2. Ensure release build type uses debug signing certificate so it can be installed immediately
  if (content.includes('signingConfig signingConfigs.debug')) {
    console.log('✔ signingConfig signingConfigs.debug already configured');
  } else {
    content = content.replace(
      /buildTypes\s*\{[\s\S]*?release\s*\{/,
      (match) => match + '\n            signingConfig signingConfigs.debug'
    );
    console.log('✔ Added signingConfig signingConfigs.debug to release build type');
  }

  fs.writeFileSync(gradlePath, content, 'utf8');
  console.log('✔ Successfully configured android/app/build.gradle for offline standalone bundling!');
} else {
  console.log('android/app/build.gradle not found yet.');
}
