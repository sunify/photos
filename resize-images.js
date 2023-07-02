import { glob } from 'glob';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

const commonIMParams = '-units PixelsPerInch -density 72 -interlace plane';
const ogIMParams = `${commonIMParams} -resize 1960x590 -extent 1200x630 -gravity center -quality 70 -strip`;
const fullIMParams = `${commonIMParams} -resize 2500x2500 -quality 90`;
const thumbIMParams = `${commonIMParams} -resize 900x900 -quality 80`;

const BASE_PATH = 'public/images';

async function run() {
  const [allPhotos, resizedPhotos] = await Promise.all([
    glob('photos/*.jpg'),
    glob('images/full/*.jpg').then((photos) =>
      photos.map((photo) => photo.replace('images/full/', ''))
    ),
  ]);

  const newPhotos = allPhotos.filter(
    (photo) => !resizedPhotos.includes(photo.replace('photos/', ''))
  );

  const filesStr = newPhotos.join(' ');
  const ogImagesProcess = execPromise(`mogrify -path ${BASE_PATH}/og ${ogIMParams} ${filesStr}`);
  const fullImagesProcess = execPromise(`mogrify -path ${BASE_PATH}/full ${fullIMParams} ${filesStr}`);
  const thumbImagesProcess = execPromise(`mogrify -path ${BASE_PATH}/thumbs ${thumbIMParams} ${filesStr}`);
  await Promise.all([ogImagesProcess, fullImagesProcess, thumbImagesProcess]);
}

run();
