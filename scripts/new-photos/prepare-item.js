import { promisify } from 'util';
import child_process from 'child_process';
import rgbHex from 'rgb-hex';
import readline from 'node:readline/promises';

import sizeOf from 'image-size';
import ColorThief from 'colorthief';
import exif from 'exif';

import { BASE_PATH } from './constants.js';

const { ExifImage } = exif;
const exec = promisify(child_process.exec);

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

async function askForTitle(fileName) {
  const answer = await readlineInterface.question(`Title for a ${fileName}: `);
  return answer.trim();
}

let readlineInterface;
export function init() {
  readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export async function prepare(fileName, oldItem) {
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
  const title = oldItem ? oldItem.title : await askForTitle(fileName);

  return {
    id: fileName.replace('.jpg', ''),
    title: title || oldItem?.title || '',
    color: hexColor,
    exif,
    size,
    placeholder,
    created: new Date(
      exif.exif.CreateDate.replace(/(\d+):(\d+):(\d+)\s(.*)/, '$1/$2/$3 $4')
    ),
  };
}

export function finish() {
  readlineInterface?.close();
}