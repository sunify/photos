import { glob } from 'glob';
import path from 'path';

export async function getNewPhotos() {
  const [allPhotos, addedItems] = await Promise.all([
    glob('source-photos/*.jpg'),
    glob('src/content/photos/*.json').then((photos) =>
      photos.map((photo) => path.basename(photo, '.json'))
    ),
  ]);

  return allPhotos.filter(
    (photo) => !addedItems.includes(path.basename(photo, '.jpg'))
  );
}
