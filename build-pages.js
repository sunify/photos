const fs = require('fs/promises');
const nunjucks = require('nunjucks');
const sizeOf = require('image-size');
const ColorThief = require('colorthief');

const rawItems = require('./items.json');

nunjucks.configure('templates', { autoescape: true });

function prepareItem(rawItem) {
  const thumbPath = `images/thumbs/${rawItem.file}`;

  return ColorThief.getColor(thumbPath).then((color) => {
    return {
      ...rawItem,
      id: rawItem.file.replace('.jpg', ''),
      color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      size: sizeOf(thumbPath),
    };
  });
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
