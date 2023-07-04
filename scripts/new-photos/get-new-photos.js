import { glob } from 'glob';

export async function getNewPhotos() {
  const [allPhotos, addedItems] = await Promise.all([
    glob('source-photos/*.jpg'),
    glob('src/content/photos/*.json').then((photos) =>
      photos.map((photo) =>
        photo.replace(`src/content/photos/`, '').replace('.json', '')
      )
    ),
  ]);

  return allPhotos.filter(
    (photo) =>
      !addedItems.includes(
        photo.replace('source-photos/', '').replace('.jpg', '')
      )
  );
}
