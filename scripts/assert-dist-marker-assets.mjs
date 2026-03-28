import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distFiles = ['dist/leaflet.js', 'dist/index.js'];
const forbiddenMarkerAssetReference = './ofeed-marker-';
const requiredMarkerAssetReference = 'data:image/svg+xml,';

const errors = [];

for (const relativeFilePath of distFiles) {
  const filePath = resolve(relativeFilePath);

  let source;

  try {
    source = await readFile(filePath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`${relativeFilePath}: unable to read built artifact (${message})`);
    continue;
  }

  if (source.includes(forbiddenMarkerAssetReference)) {
    errors.push(
      `${relativeFilePath}: contains forbidden preset asset reference "${forbiddenMarkerAssetReference}"`,
    );
  }

  if (!source.includes(requiredMarkerAssetReference)) {
    errors.push(
      `${relativeFilePath}: missing inline preset asset marker "${requiredMarkerAssetReference}"`,
    );
  }
}

if (errors.length > 0) {
  throw new Error(['Built marker asset regression detected.', ...errors].join('\n'));
}

console.log(
  `Verified built marker assets in ${distFiles.join(', ')}. Preset SVGs are bundled as inline data URLs.`,
);
