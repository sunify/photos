import * as prepareItem from './common/prepare-item.js';
import { resizePhotos } from './common/resize-photos.js';
import { readJSONFile } from './common/read-json-file.js';

const fileName = process.argv[2];
const photoId = fileName.replace('.jpg', '');


async function run() {
  prepareItem.init();

  await resizePhotos([`source-photos/${photoId}.jpg`]);

  const jsonPath = `src/content/photos/${photoId}.json`;
  const existingItem = await readJSONFile(jsonPath);
  await prepareItem.prepare(`${photoId}.jpg`, existingItem);

  prepareItem.finish();
}

run();