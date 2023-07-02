<script>
  import { makeGrid } from "../helpers/make-grid";

  export let photos;

  $: grid = makeGrid(photos);
</script>

<div class="grid">
{#each grid as row, rowI}
  <div class="row">
    {#each row as item}
      <a href="{item.id}" tabindex="0" class="item {item.isVertical ? '-v' : '-h'}" style="width: {item.gridSize}%">
        <div class="image-container {item.isVertical ? '-v' : '-h'}">
          <img src="images/thumbs/{item.id}.jpg" style="background-color: {item.data.color};" loading={rowI > 2 ? 'lazy' : 'eager'} alt="{item.data.title}">
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