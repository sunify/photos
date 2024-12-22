export const sizesMap = {
  s: 1000,
  m: 2000,
  l: 3000,
};

// ToDo: почему-то не работает импорт таких типов, разберись
export type Size = keyof typeof sizesMap;

type LayoutOptions = {
  size: Size;
  spacing: number;
};

type LayoutItem = {
  image: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Layout = {
  items: Array<LayoutItem>;
  w: number;
  h: number;
};

function calcSize(size: Size) {
  return sizesMap[size];
}

function calcSpacing(spacing: number, size: Size) {
  return calcSize(size) * (spacing / 100);
}

function linearLayout(
  images: Array<HTMLImageElement>,
  { size, spacing }: LayoutOptions,
  vertical: boolean
): Layout {
  const items: Array<LayoutItem> = [];
  const result = {
    items,
    w: 0,
    h: 0
  };

  const aspects = images.map((image) => image.width / image.height);
  const realSize = calcSize(size);
  const realSpacing = calcSpacing(spacing, size);
  const rects = aspects.map((aspect) => {
    if (vertical) {
      return [realSize, Math.round(realSize / aspect)];
    }
    return [Math.round(realSize * aspect), realSize];
  });
  const totalLength = rects.map(([w, h]) => {
    return vertical ? h : w;
  }).reduce((a, b) => a + b, realSpacing * (images.length + 1));

  if (vertical) {
    result.w = realSize + realSpacing * 2;
    result.h = totalLength;
  } else {
    result.w = totalLength;
    result.h = realSize + realSpacing * 2;
  }

  let offset = realSpacing;
  images.forEach((image, i) => {
    const rect = rects[i];
    if (vertical) {
      result.items.push({
        image,
        x: realSpacing,
        y: offset,
        w: rect[0],
        h: rect[1]
      });
      offset += rect[1] + realSpacing;
    } else {
      result.items.push({
        image,
        x: offset,
        y: realSpacing,
        w: rect[0],
        h: rect[1]
      });
      offset += rect[0] + realSpacing;
    }
  });

  return result;
}

function verticalLayout(
  images: Array<HTMLImageElement>,
  options: LayoutOptions
) {
  return linearLayout(images, options, true);
}

function horizontalLayout(
  images: Array<HTMLImageElement>,
  options: LayoutOptions
) {
  return linearLayout(images, options, false);
}

export const layouts = {
  horizontal: horizontalLayout,
  vertical: verticalLayout
};

export type LayoutType = keyof typeof layouts;
