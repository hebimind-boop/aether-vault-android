const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '../node_modules/react-native-svg/android/src/main/java/com/horcrux/svg/RenderableViewManager.java'
);

console.log('Checking target file:', targetFile);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  const regex = /private\s+static\s+void\s+setTransformProperty\s*\(\s*View\s+view\s*,\s*ReadableArray\s+transforms\s*\)\s*\{[\s\S]*?\n\s*\}/;

  if (regex.test(content)) {
    content = content.replace(
      regex,
      'private static void setTransformProperty(View view, ReadableArray transforms) {\n    // Patched for React Native 0.74 compilation compatibility\n  }'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✔ Successfully patched react-native-svg for React Native 0.74!');
  } else {
    console.log('setTransformProperty pattern not matched or already patched.');
  }
} else {
  console.log('RenderableViewManager.java not present yet (pre-install).');
}
