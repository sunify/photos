<script lang="ts">
import { onMount } from 'svelte';
import type { CollectionEntry } from 'astro:content';

export let photo: CollectionEntry<'photos'>;
export let previewId: string | null = null;
export let nextId: string | null = null;

let loaded = false;
let previewImg: HTMLElement;
let isVertical = true;

$: aspectRatio = photo.data.size.width / photo.data.size.height;

function handleResize() {
  console.log(previewImg);
}

onMount(() => {
  handleResize();
});
</script>

<svelte:window on:resize={handleResize} />

<div class="preview {loaded ? 'loaded' : ''}">
  <img
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    data-src="images/full/{photo.id}.jpg"
    data-aspect={aspectRatio}
    alt="{photo.data.title}"
    bind:this={previewImg}
  />
  <div class="preview-placeholder {isVertical ? '-v' : '-h'}" style="aspect-ratio: {aspectRatio}; background-color: {photo.data.color}"></div>

  <a href="." class="back">Back</a>
</div>

<style>
@keyframes pulse {
  0% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.5;
  }
}

.preview {
  --side-padding: 40px;
  --top-padding: 40px;
  --bottom-padding: 50px;
  width: 100%;
  height: 100%;
  padding: var(--top-padding) var(--side-padding) var(--bottom-padding) var(--side-padding);
}

.preview-placeholder {
  animation: pulse 1s ease-in-out infinite alternate-reverse;
  display: none;
}

.loaded .preview-placeholder {
  animation: none;
}

.preview img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;

  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.loaded img {
  opacity: 1;
}

.full .preview {
  width: auto;
  height: auto;
  padding: 0;
}

.full .preview img {
  width: auto;
  height: auto;
  padding: var(--side-padding);
  background: none !important;
  margin: 0 auto;
}

.preview-placeholder.-v {
  position: absolute;
  left: 50%;
  top: var(--top-padding);
  bottom: var(--bottom-padding);
  transform: translateX(-50%);
}

.preview-placeholder.-h {
  position: absolute;
  top: calc(50% - (var(--bottom-padding) - var(--top-padding)) / 2);
  left: var(--side-padding);
  right: var(--side-padding);
  transform: translateY(-50%);
}

.full .preview .preview-placeholder {
  display: none !important;
}
</style>