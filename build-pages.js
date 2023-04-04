const fs = require('fs/promises');
const nunjucks = require('nunjucks');
const sizeOf = require('image-size');

const rawItems = require('./items.json');

nunjucks.configure('templates', { autoescape: true });

function prepareItem(rawItem) {
  return {
    ...rawItem,
    id: rawItem.file.replace('.jpg', ''),
    size: sizeOf(`photos/${rawItem.file}`),
  };
}

const items = rawItems.map(prepareItem)

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

Promise.all(promises).then(() => console.log('done'));
