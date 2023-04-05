const fs = require('fs/promises');
const nunjucks = require('nunjucks');
const sizeOf = require('image-size');
const ColorThief = require('colorthief');
const { ExifImage } = require('exif');

const rawItems = require('./items.json');

const env = nunjucks.configure('templates', { autoescape: true });
env.addGlobal('formatExposure', (exposureTime) => {
  if (exposureTime < 1) {
    return `1/${1/exposureTime}`;
  } else {
    return exposureTime;
  }
});
env.addGlobal('formatModel', (model) => {
  const replacements = {
    'RICOH GR III': 'GRIII'
  };
  return replacements[model] || model;
});

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

function prepareItem(rawItem) {
  const thumbPath = `images/thumbs/${rawItem.file}`;

  return Promise.all([ColorThief.getColor(thumbPath), getExif(thumbPath)]).then(
    ([color, exif]) => {
      return {
        ...rawItem,
        id: rawItem.file.replace('.jpg', ''),
        color: rgb(color),
        exif,
        size: sizeOf(thumbPath),
      };
    }
  );
}

Promise.all(rawItems.map(prepareItem))
  .then((items) => {
    const promises = [
      fs.writeFile('build/index.html', nunjucks.render('index.j2', { items }), {
        encoding: 'utf-8',
      }),
    ];
    promises.push(
      ...items.map((item) => {
        return fs.writeFile(
          `build/${item.id}.html`,
          nunjucks.render('item.j2', { item }),
          {
            encoding: 'utf-8',
          }
        );
      })
    );

    return Promise.all(promises);
  })
  .then(() => console.log('done'));
