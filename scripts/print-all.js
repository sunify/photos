import { glob } from 'glob';
import { printImage } from './common/print-image.js';

async function getAllPhotos() {
  return glob('source-photos/*.jpg');
}

async function main() {
  // await printImage('source-photos/R0010094.jpg');
  // await printImage('source-photos/P1100757.jpg');
  await printImage('source-photos/R0011413.jpg');
  // await printImage('source-photos/P1110716.jpg');
  // await printImage('source-photos/R0008031.jpg');
  // await printImage('source-photos/R0009510.jpg');
  // await getAllPhotos().then(async (photos) => {
  //   for (const photo of photos) {
  //     console.log(photo);
  //     await printImage(photo);
  //   }
  // });
}

main();
