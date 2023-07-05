import path from 'path';
import fs from 'fs/promises';

import { getNewPhotos } from './get-new-photos.js';
import { resizePhotos } from './resize-photos.js';
import { readJSONFile } from './read-json-file.js';
import * as prepareItem from './prepare-item.js';

async function run() {
  const newPhotos = await getNewPhotos();

  await resizePhotos(newPhotos);

  prepareItem.init();

  for (const photo of newPhotos) {
    const basename = path.basename(photo);
    const jsonPath = `src/content/photos/${basename.replace(
      '.jpg',
      '.json'
    )}`;
    const existingItem = await readJSONFile(jsonPath);
    const item = await prepareItem.prepare(basename, existingItem);
    await fs.writeFile(jsonPath, JSON.stringify(item, null, 2), 'utf-8');
  }

  prepareItem.finish();
}

run();
