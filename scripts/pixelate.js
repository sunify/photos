import { glob } from 'glob';
import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';

async function getAllPhotos() {
  return glob('source-photos/*.jpg');
}

function initRandom(points, k) {
  function random(start, end) {
    return Math.round(Math.random() * (end - start)) + start;
  }

  const indicies = new Set();
  while (indicies.size < k) {
    indicies.add(random(0, points.length));
  }

  return [...indicies].map((i) => points[i]);
}

function closestPointIndex(points, point, distanceFn) {
  let result = 0;
  let pDistance = distanceFn(points[0], point);
  for (let i = 1; i < points.length; i += 1) {
    const dst = distanceFn(points[i], point);
    if (dst < pDistance) {
      pDistance = dst;
      result = i;
    }
  }

  return result;
};

function kMeans(
  points,
  k,
  { distanceFn, centroidFn, initFn = initRandom }
) {
  const clusters = [];
  const initialPoints = initFn(points, k);

  initialPoints.forEach((point) => {
    clusters.push({
      center: point,
      points: [],
    });
  });

  const centerPoint = (points) => {
    const centerIndex = closestPointIndex(
      points,
      centroidFn(points),
      distanceFn
    );
    return points[centerIndex];
  };

  const assingPoints = () => {
    const centers = clusters.map((c) => c.center);
    points.forEach((point) => {
      const clusterIndex = closestPointIndex(centers, point, distanceFn);
      clusters[clusterIndex].points.push(point);
    });
  };

  const updateCenters = () => {
    clusters.forEach((cluster) => {
      cluster.center = centerPoint(cluster.points);
      cluster.points = [];
    });
  };

  assingPoints();

  for (let i = 0; i < 25; i += 1) {
    updateCenters();
    assingPoints();
  }

  return clusters.map((c) => c.points);
}

function rgb(c) {
  const color = parseInt(c.replace('#', ''), 16);
  return [(color >> 16) & 255, (color >> 8) & 255, color & 255];
}

function hex(red, green, blue) {
  const rgb = (red << 16) | (green << 8) | (blue << 0);
  return '#' + (0x1000000 + rgb).toString(16).slice(1);
}

function colorDistance(c1, c2) {
  const [r1, g1, b1] = rgb(c1);
  const [r2, g2, b2] = rgb(c2);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );
}

function makeColorsMap(colors, palleteSize) {
  const uniqueColors = [...new Set(colors.flat())];
  if (uniqueColors.length <= palleteSize) {
    return colors;
  }

  const clusters = kMeans(uniqueColors, palleteSize, {
    distanceFn: colorDistance,
    centroidFn: (colors) => {
      const [r, g, b] = colors
        .reduce(
          (acc, color) => {
            return rgb(color).map((component, i) => component + acc[i]);
          },
          [0, 0, 0]
        )
        .map((n) => Math.round(n / colors.length));
      return hex(r, g, b);
    },
  });

  const colorsMap = {};
  clusters.forEach((cluster) => {
    cluster.forEach((color) => {
      colorsMap[color] = cluster[0];
    });
  });

  return colorsMap;
}

function intToCssHex(int) {
  const { r, g, b } = Jimp.intToRGBA(int);
  return hex(r, g, b);
}

async function pixelatePhoto(photo) {
  const savePath = path.join('pixel', path.basename(photo));
  if (fs.existsSync(savePath)) {
    console.log('skip');
    return;
  }
  const image = await Jimp.read(photo);
  const [ogWidth, ogHeight] = [image.getWidth(), image.getHeight()];
  image.resize(Jimp.AUTO, 100);
  const [width, height] = [image.getWidth(), image.getHeight()];

  const colors = [];
  for (let y = 0; y <= height; y += 1) {
    const row = [];
    for (let x = 0; x <= width; x += 1) {
      row.push(intToCssHex(image.getPixelColor(x, y)));
    }
    colors.push(row);
  }
  const colorsMap = makeColorsMap(colors, 100);
  for (let y = 0; y <= height; y += 1) {
    for (let x = 0; x <= width; x += 1) {
      const newColor = Jimp.cssColorToHex(colorsMap[intToCssHex(image.getPixelColor(x, y))]);
      image.setPixelColor(newColor, x, y);
    }
  }
  image.resize(ogWidth, ogHeight, Jimp.RESIZE_NEAREST_NEIGHBOR);
  await image.writeAsync(savePath);
}

async function main() {
  let photos = await getAllPhotos();
  // photos = photos.slice(0, 1);
  for (const photo of photos) {
    try {
      await pixelatePhoto(photo);
    } catch (e) {
      console.log(photo);
    }
  }
}

main();
