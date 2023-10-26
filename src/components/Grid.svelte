<script lang="ts">
import type { CollectionEntry } from 'astro:content';
import { makeGrid } from '../helpers/make-grid';
import GridCell from './GridCell.svelte';
  import { onDestroy, onMount } from 'svelte';

export let photos: CollectionEntry<'photos'>[];

const breakpoints = {
  0: 1,
  900: 2.1,
  1600: 3.1,
  2000: 4.1,
  2300: 5.1,
};

$: grid = makeGrid(photos, 2.1);
$: ready = false;

const media: Map<MediaQueryList, number> = new Map();
function handleMediaChange(e: MediaQueryListEvent) {
  const target = e.target as MediaQueryList;
  if (target.matches) {
    grid = makeGrid(photos, media.get(target));
  }
}
onMount(() => {
  ready = true;
  Object.entries(breakpoints).map(([w, r]) => [Number(w), r]).forEach(([width, rowLength], i, arr) => {
    if (arr[i + 1]) {
      const [width2] = arr[i + 1];
      media.set(window.matchMedia(`(min-width: ${width}px) and (max-width: ${width2 - 1}px)`), rowLength);
    } else {
      media.set(window.matchMedia(`(min-width: ${width}px)`), rowLength);
    }
  });
  for (const md of media.keys()) {
    md.addEventListener('change', handleMediaChange);
    if (md.matches) {
      grid = makeGrid(photos, media.get(md));
    }
  }
});

onDestroy(() => {
  for (const md of media.keys()) {
    md.removeEventListener('change', handleMediaChange);
  }
});
</script>

<div class="grid {ready ? 'loaded' : ''}">
  {#each grid as row, rowI}
    <div class="row">
      {#each row as cell}
        <GridCell
          photo={cell.item}
          gridSize={cell.gridSize}
          isVertical={cell.isVertical}
          lazy={rowI > 2}
        />
      {/each}
    </div>
  {/each}
</div>

<style>
.grid {
  margin: 35px;
  opacity: 0;
  transition: opacity 0.3s;
}
.grid.loaded {
  opacity: 1;
}

.row {
  display: flex;
  justify-content: center;
}

@media screen and (max-width: 640px) {
  .grid {
    margin: 15px;
  }

  .row {
    display: block;
  }
}
</style>
