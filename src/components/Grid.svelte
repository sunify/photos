<script lang="ts">
import type { CollectionEntry } from 'astro:content';
import { makeGrid } from '../helpers/make-grid';

export let photos: CollectionEntry<'photos'>[];

$: grid = makeGrid(photos);
</script>

<div class="grid">
  {#each grid as row, rowI}
    <div class="row">
      {#each row as cell}
        <a
          href={cell.item.id}
          tabindex="0"
          class="item {cell.isVertical ? '-v' : '-h'}"
          style="width: {cell.gridSize}%"
        >
          <div class="image-container {cell.isVertical ? '-v' : '-h'}">
            <img
              src="images/thumbs/{cell.item.id}.jpg"
              style="background-color: {cell.item.data.color};"
              loading={rowI > 2 ? 'lazy' : 'eager'}
              alt={cell.item.data.title}
            />
          </div>
        </a>
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

  .item {
    padding: 5px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-container.-v {
    height: 100%;
    aspect-ratio: 3/4;
  }

  .image-container.-h {
    width: 100%;
    aspect-ratio: 4/3;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease-in-out;
    font-size: 0;
    display: block;
  }

  .item:hover img,
  .item:focus-visible img {
    transform: scale(0.95);
  }

  @media screen and (max-width: 640px) {
    .grid {
      margin: 15px;
    }

    .row {
      display: block;
    }

    .item {
      width: 100% !important;
    }
  }
</style>
