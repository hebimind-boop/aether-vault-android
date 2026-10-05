const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '../node_modules/react-native-svg/android/src/main/java/com/horcrux/svg/RenderableViewManager.java'
);

console.log('Checking target file:', targetFile);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  const regex = /private\s+static\s+void\s+setTransformProperty\s*\([\s\S]*?private\s+static\s+void\s+resetTransformProperty/;

  if (regex.test(content)) {
    content = content.replace(
      regex,
      'private static void setTransformProperty(View view, ReadableArray transforms) {\n    // Patched for React Native 0.74 compatibility\n  }\n\n  private static void resetTransformProperty'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✔ Successfully patched RenderableViewManager.java for React Native 0.74!');
  } else {
    console.log('setTransformProperty already patched or pattern not found.');
  }
} else {
  console.log('RenderableViewManager.java not present yet.');
}
