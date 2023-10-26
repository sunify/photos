import type { CollectionEntry } from 'astro:content';

type GridItem<T> = {
  item: T;
  isVertical: boolean;
  gridSize: number;
};

type GridRow<T> = GridItem<T>[];
type Grid<T> = GridRow<T>[];

export function makeGrid<T extends CollectionEntry<'photos'>>(items: T[], rowLength = 2.1): Grid<T> {
  const grid = [];
  let currentRow = [];
  let currentRowLength = 0;

  function postProcessRow(row: GridRow<T>) {
    const getItemSize = (item: GridItem<T>) => item.isVertical ? 0.565 : 1
    const rowSize = Math.max(row.map(getItemSize).reduce((a, b) => a + b, 0), rowLength);
    row.forEach((item) => {
      item.gridSize = getItemSize(item) / rowSize * 100;
    });
  }

  for (const item of items) {
    const isVertical = item.data.size.width < item.data.size.height;
    const itemSize = isVertical ? 0.565 : 1;
    const newItem: GridItem<T> = {
      item,
      isVertical,
      gridSize: 0
    }
    currentRow.push(newItem);
    currentRowLength += itemSize;

    if (currentRowLength >= rowLength) {
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