import chalk from 'chalk';
import Jimp from 'jimp';

function printPixels(image) {
  const rows = [];
  for (let y = 0; y < image.getHeight(); y += 2) {
    let row = '';
    for (let x = 0; x < image.getWidth(); x += 1) {
      const color1 = image.getPixelColor(x, y);
      const color2 = image.getPixelColor(x, y + 1);
      row += chalk.hex(color2).bgHex(color1)(
        '\u2584'
      );
    }
    rows.push(row);
  }

  console.log(rows.join('\n'));
}

export function printImage(path) {
  return Jimp.read(path)
    .then((image) => {
      return image.resize(Jimp.AUTO, 50);
    })
    .then((image) => {
      printPixels(image);
    });
}
