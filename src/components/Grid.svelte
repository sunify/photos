<script lang="ts">
import type { CollectionEntry } from 'astro:content';
import { makeGrid } from '../helpers/make-grid';
import GridCell from './GridCell.svelte';

export let photos: CollectionEntry<'photos'>[];

$: grid = makeGrid(photos);
</script>

<div class="grid">
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
