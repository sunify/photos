export function makeGrid(items) {
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
    const isVertical = item.data.size.width < item.data.size.height;
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