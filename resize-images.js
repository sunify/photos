const glob = require('glob');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
  const ogImagesProcess = exec(
    `mogrify -path images/og -units PixelsPerInch -density 72 -interlace plane -resize 1960x590 -extent 1200x630 -gravity center -quality 70 -strip ${filesStr}`
  );
  const fullImagesProcess = exec(
    `mogrify -path images/full -units PixelsPerInch -density 72 -interlace plane -resize 2500x2500 -quality 90 ${filesStr}`
  );
  const thumbImagesProcess = exec(
    `mogrify -path images/thumbs -units PixelsPerInch -density 72 -interlace plane -resize 900x900 -quality 80 ${filesStr}`
  );
  await Promise.all([ogImagesProcess, fullImagesProcess, thumbImagesProcess]);
}

run();
