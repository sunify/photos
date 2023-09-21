import { posterize } from "./posterize";

function colorAt(context: CanvasRenderingContext2D, x: number, y: number) {
  const imageData = context.getImageData(x, y, 1, 1) as ImageData;
  return (
    '#' +
    imageData.data[0].toString(16).padStart(2, '0') +
    imageData.data[1].toString(16).padStart(2, '0') +
    imageData.data[2].toString(16).padStart(2, '0')
  );
}

function collectColors(context: CanvasRenderingContext2D): string[][] {
  const colors: string[][] = [];
  for (let y = 0; y < context.canvas.height; y += 1) {
    const row: string[] = [];
    for (let x = 0; x < context.canvas.width; x += 1) {
      row.push(colorAt(context, x, y));
    }
    colors.push(row);
  }

  return colors;
}

export function printImageToConsole(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = Math.round(50 * (image.width / image.height));
  canvas.height = 50;
  if (!context) {
    return;
  }
  context.imageSmoothingQuality = 'high';
  context.imageSmoothingEnabled = true;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let res = '\n';
  const styles = [];
  let colors = collectColors(context);
  colors = posterize(colors, 34);
  for (let y = 0; y < colors.length; y += 2) {
    for (let x = 0; x < colors[y].length; x += 1) {
      const color1 = colors[y][x];
      const color2 = colors[y + 1][x];
      res += '%c\u2584';
      styles.push(
        `background-color: ${color1};color: ${color2};font-size: 15px;`
      );
    }
    res += '\n';
  }
  // for (let y = 0; y < canvas.height; y += 2) {
  //   for (let x = 0; x < canvas.width; x += 1) {
  //     const color1 = colorAt(context, x, y);
  //     const color2 = colorAt(context, x, y + 1);
  //     res += '%c\u2584';
  //     styles.push(
  //       `background-color: ${color1};color: ${color2};font-size: 15px;`
  //     );
  //   }
  //   res += '\n';
  // }
  console.log(res, ...styles);
}