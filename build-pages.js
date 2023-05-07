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
        created: new Date(exif.exif.CreateDate.replace(/(\d+):(\d+):(\d+)\s(.*)/, '$1/$2/$3 $4'))
      };
    }
  );
}

Promise.all(rawItems.map(prepareItem))
  .then((items) => items.sort((a, b) => {
    return b.created - a.created;
  }))
  .then((items) => {
    const promises = [
      fs.writeFile('build/index.html', nunjucks.render('index.j2', { items, grid: makeGrid(items) }), {
        encoding: 'utf-8',
      }),
    ];
    promises.push(
      ...items.map((item, index) => {
        return fs.writeFile(
          `build/${item.id}.html`,
          nunjucks.render('item.j2', {
            item,
            prevItem: items[index - 1],
            nextItem: items[index + 1]
          }),
          {
            encoding: 'utf-8',
          }
        );
      })
    );

    return Promise.all(promises);
  })
  .then(() => console.log('done'));

function makeGrid(items) {
  const MAX_ROW_LENGTH = 2.1;
  const grid = [];
  let currentRow = [];
  let currentRowLength = 0;

  function postProcessRow(row) {
    const getItemSize = (item) => item.isVertical ? 0.565 : 1
    const rowSize = Math.max(row.map(getItemSize).reduce((a, b) => a + b, 0), MAX_ROW_LENGTH);
    row.forEach((item) => {
      item.gridSize = getItemSize(item) / rowSize * 100;
    });
  }

  for (const item of items) {
    const isVertical = item.size.width < item.size.height;
    const itemSize = isVertical ? 0.565 : 1;
    item.isVertical = isVertical;
    currentRow.push(item);
    currentRowLength += itemSize;

    if (currentRowLength >= MAX_ROW_LENGTH) {
      grid.push(currentRow);
      postProcessRow(currentRow);
      currentRow = [];
      currentRowLength = 0;
    }
  }

  if (currentRow.length) {
    grid.push(currentRow);
    postProcessRow(currentRow);
  }

  return grid;
}