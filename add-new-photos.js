import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { promisify } from 'util';
import child_process from 'child_process';

import sizeOf from 'image-size';
import ColorThief from 'colorthief';
import exif from 'exif';

const { ExifImage } = exif;
const exec = promisify(child_process.exec);
const writeFile = promisify(fs.writeFile);

const commonIMParams = '-units PixelsPerInch -density 72 -interlace plane';
const ogIMParams = `${commonIMParams} -resize 1960x590 -extent 1200x630 -gravity center -quality 70 -strip`;
const fullIMParams = `${commonIMParams} -resize 2500x2500 -quality 90`;
const thumbIMParams = `${commonIMParams} -resize 900x900 -quality 80`;

const BASE_PATH = 'public/images';

async function getNewPhotos() {
  const [allPhotos, resizedPhotos] = await Promise.all([
    glob('photos/*.jpg'),
    glob(`${BASE_PATH}/full/*.jpg`).then((photos) =>
      photos.map((photo) => photo.replace(`${BASE_PATH}/full/`, ''))
    ),
  ]);

  return allPhotos.filter(
    (photo) => !resizedPhotos.includes(photo.replace('photos/', ''))
  );
}

async function resizePhotos(photos) {
  const filesStr = photos.join(' ');
  const ogImagesProcess = exec(
    `mogrify -path ${BASE_PATH}/og ${ogIMParams} ${filesStr}`
  );
  const fullImagesProcess = exec(
    `mogrify -path ${BASE_PATH}/full ${fullIMParams} ${filesStr}`
  );
  const thumbImagesProcess = exec(
    `mogrify -path ${BASE_PATH}/thumbs ${thumbIMParams} ${filesStr}`
  );
  await Promise.all([ogImagesProcess, fullImagesProcess, thumbImagesProcess]);
}

function getExif(image) {
  return new Promise((resolve, reject) => {
    new ExifImage({ image }, (err, exif) => {
      if (err) {
        return reject(err);
      }

      resolve(exif);
    });
  });
}

function rgb([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

async function prepareItem(fileName) {
  const fullPath = `${BASE_PATH}/full/${fileName}`;
  const thumbPath = `${BASE_PATH}/thumbs/${fileName}`;

  const [color, exif] = await Promise.all([
    ColorThief.getColor(thumbPath),
    getExif(fullPath),
  ]);

  return {
    id: fileName.replace('.jpg', ''),
    title: '',
    color: rgb(color),
    exif,
    size: sizeOf(thumbPath),
    created: new Date(
      exif.exif.CreateDate.replace(/(\d+):(\d+):(\d+)\s(.*)/, '$1/$2/$3 $4')
    ),
  };
}

async function run() {
  const newPhotos = await getNewPhotos();

  await resizePhotos(newPhotos);
  await Promise.all(
    newPhotos.map(async (photo) => {
      const basename = path.basename(photo);
      const item = await prepareItem(basename);
      await writeFile(
        `src/content/photos/${basename.replace('.jpg', '.json')}`,
        JSON.stringify(item, null, 2),
        'utf-8'
      );
    })
  );
}

run();