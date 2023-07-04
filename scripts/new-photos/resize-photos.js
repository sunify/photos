import { promisify } from 'util';
import child_process from 'child_process';
import { BASE_PATH } from "./constants.js";

const exec = promisify(child_process.exec);

const commonIMParams = '-units PixelsPerInch -density 72 -interlace plane';
const ogIMParams = `${commonIMParams} -resize 1960x590 -extent 1200x630 -gravity center -quality 70 -strip`;
const fullIMParams = `${commonIMParams} -resize 2500x2500 -quality 90`;
const thumbIMParams = `${commonIMParams} -resize 900x900 -quality 80`;

export async function resizePhotos(photos) {
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