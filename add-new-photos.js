import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { promisify } from 'util';
import child_process from 'child_process';
import rgbHex from 'rgb-hex';

import sizeOf from 'image-size';
import ColorThief from 'colorthief';
import exif from 'exif';

const { ExifImage } = exif;
const exec = promisify(child_process.exec);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const commonIMParams = '-units PixelsPerInch -density 72 -interlace plane';
const ogIMParams = `${commonIMParams} -resize 1960x590 -extent 1200x630 -gravity center -quality 70 -strip`;
const fullIMParams = `${commonIMParams} -resize 2500x2500 -quality 90`;
const thumbIMParams = `${commonIMParams} -resize 900x900 -quality 80`;

const BASE_PATH = 'public/images';

async function getNewPhotos() {
  const [allPhotos, addedItems] = await Promise.all([
    glob('source-photos/*.jpg'),
    glob('src/content/photos/*.json').then((photos) =>
      photos.map((photo) =>
        photo.replace(`src/content/photos/`, '').replace('.json', '')
      )
    ),
  ]);

  return allPhotos;
  return allPhotos.filter(
    (photo) =>
      !addedItems.includes(photo.replace('photos/', '').replace('.jpg', ''))
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
  return '#' + rgbHex(r, g, b);
}

async function makePlaceholder(aspectRatio, color) {
  const result = await exec(
    `convert -size ${Math.round(
      500 * aspectRatio
    )}x500 xc:${color} png:- | base64`
  );
  return result.stdout.trim();
}

async function prepareItem(fileName, oldItem) {
  const fullPath = `${BASE_PATH}/full/${fileName}`;
  const thumbPath = `${BASE_PATH}/thumbs/${fileName}`;

  const [color, exif] = await Promise.all([
    ColorThief.getColor(thumbPath),
    getExif(fullPath),
  ]);

  const size = sizeOf(thumbPath);
  const aspectRatio = size.width / size.height;
  const hexColor = rgb(color);
  const placeholder = await makePlaceholder(aspectRatio, hexColor);

  return {
    id: fileName.replace('.jpg', ''),
    title: oldItem?.title || '',
    color: hexColor,
    exif,
    size,
    placeholder,
    created: new Date(
      exif.exif.CreateDate.replace(/(\d+):(\d+):(\d+)\s(.*)/, '$1/$2/$3 $4')
    ),
  };
}

async function readItemJSON(fileName) {
  try {
    const data = await readFile(fileName, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

async function run() {
  const newPhotos = await getNewPhotos();

  await resizePhotos(newPhotos);
  await Promise.all(
    newPhotos.map(async (photo) => {
      const basename = path.basename(photo);
      const jsonPath = `src/content/photos/${basename.replace(
        '.jpg',
        '.json'
      )}`;
      const existingItem = await readItemJSON(jsonPath);
      const item = await prepareItem(basename, existingItem);
      await writeFile(jsonPath, JSON.stringify(item, null, 2), 'utf-8');
    })
  );
}

run();
