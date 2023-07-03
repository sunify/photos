<script lang="ts">
import { onMount } from 'svelte';
import type { CollectionEntry } from 'astro:content';
import PreviewNav from './PreviewNav.svelte';

export let photo: CollectionEntry<'photos'>;
export let prevPhotoId: string | null = null;
export let nextPhotoId: string | null = null;

$: imageUrl = `images/full/${photo.id}.jpg`;
let loaded = false;
let full = false;

function handleImageClick(e: MouseEvent) {
  if (!full) {
    const { pageX, pageY } = e;
    setTimeout(() => {
      const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      const roundPercents = (p: number) => Math.round(p * 100) / 100;
      window.scrollTo(
        maxScrollX * roundPercents(pageX / window.innerWidth),
        maxScrollY * roundPercents(pageY / window.innerHeight)
      );
    })
  }
  full = !full;
}

function noop() {}

function preloadPhoto() {
  return new Promise((resolve) => {
    const preloader = new Image();
    preloader.onload = () => {
      resolve(true);
    };
    preloader.src = imageUrl;
  });
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function handleKeyup(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    full = false;
  }
}

onMount(() => {
  Promise.all([preloadPhoto(), delay(400)]).then(() => {
    loaded = true;
  });
});
</script>

<svelte:window on:keyup={handleKeyup} />

<div class="preview {loaded ? 'loaded' : ''} {full ? 'full' : ''}">
  <img
    class="photo"
    src={loaded ? imageUrl : `data:image/png;base64,${photo.data.placeholder}`}
    data-src=""
    alt={photo.data.title}
    on:click={handleImageClick}
    on:keyup={noop}
  />

  <img
    src="data:image/png;base64,{photo.data.placeholder}"
    class="placeholder"
    alt="placeholder"
  />

  {#if !full}
    <PreviewNav {prevPhotoId} {nextPhotoId} />
  {/if}
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
  position: relative;
  --side-padding: 40px;
  --top-padding: 40px;
  --bottom-padding: 50px;
  width: 100%;
  height: 100%;
  padding: var(--top-padding) var(--side-padding) var(--bottom-padding)
    var(--side-padding);
}

.full {
  background: #FFF;
  z-index: 100;
}

.photo, .placeholder {
  object-fit: contain;
  display: block;
  position: absolute;
  top: var(--top-padding);
  left: var(--side-padding);
  width: calc(100% - var(--side-padding) * 2);
  height: calc(100% - var(--top-padding) - var(--bottom-padding));
}

.placeholder {
  animation: pulse 1s ease-in-out infinite alternate-reverse;
}

.loaded .placeholder {
  animation: none;
}

.photo {
  z-index: 100;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.loaded .photo {
  opacity: 1;
}

.full.preview {
  width: auto;
  height: auto;
  padding: 0;
}

.full.preview .photo {
  width: auto;
  height: auto;
  left: 0;
  top: 0;
  position: relative;
  padding: var(--side-padding);
  background: none !important;
  margin: 0 auto;
}

.full.preview .placeholder {
  display: none !important;
}
</style>
