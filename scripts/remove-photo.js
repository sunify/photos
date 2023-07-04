import fs from 'fs/promises';

const fileName = process.argv[2];
const photoId = fileName.replace('.jpg', '');

const pathesToDelete = [
  `source-photos/${photoId}.jpg`,
  `public/images/full/${photoId}.jpg`,
  `public/images/og/${photoId}.jpg`,
  `public/images/thumbs/${photoId}.jpg`,
  `src/content/photos/${photoId}.json`,
];

async function run() {
  await Promise.all(pathesToDelete.map(path => fs.unlink(path)));
}

run();