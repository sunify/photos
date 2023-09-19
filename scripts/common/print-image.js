import chalk from 'chalk';
import Jimp from 'jimp';

export function printImage(path) {
  return Jimp.read(path)
    .then((image) => {
      return image.scaleToFit(30, 30);
    })
    .then((image) => {
      const rows = [];
      for (let y = 0; y < image.getHeight(); y += 1) {
        let row = '';
        for (let x = 0; x < image.getWidth(); x += 1) {
          row += chalk.bgHex(image.getPixelColor(x, y))('  ');
        }
        rows.push(row);
      }

      console.log(rows.join('\n'));
    });
}


