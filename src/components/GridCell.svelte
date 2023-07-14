<script lang="ts">
  import type { CollectionEntry } from 'astro:content';
  export let photo: CollectionEntry<'photos'>;
  export let gridSize: number;
  export let isVertical: boolean;
  export let lazy: boolean = false;
</script>

<a
  href={`${photo.id}/`}
  tabindex="0"
  class="item {isVertical ? '-v' : '-h'}"
  style="width: {gridSize}%"
>
  <div class="image-container {isVertical ? '-v' : '-h'}">
    <img
      src="images/thumbs/{photo.id}.jpg"
      style="background-color: {photo.data.color};"
      loading={lazy ? 'lazy' : 'eager'}
      alt={photo.data.title}
    />
  </div>
</a>

<style>
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
  .item {
    width: 100% !important;
  }
}
</style>