<script lang="ts">
  import { onMount } from 'svelte';
  import type { CollectionEntry } from 'astro:content';
  import PreviewNav from './PreviewNav.svelte';

  export let photo: CollectionEntry<'photos'>;
  export let previewId: string | null = null;
  export let nextId: string | null = null;

  $: imageUrl = `images/full/${photo.id}.jpg`;

  let loaded = false;

  onMount(() => {
    const preloader = new Image();
    preloader.onload = () => {
      loaded = true;
    };
    preloader.src = imageUrl;
  });
</script>

<div class="preview {loaded ? 'loaded' : ''}">
  <img
    class="photo"
    src={loaded ? imageUrl : `data:image/png;base64,${photo.data.placeholder}`}
    data-src=""
    alt={photo.data.title}
  />

  <img
    src="data:image/png;base64,{photo.data.placeholder}"
    class="placeholder"
    alt="placeholder"
  />

  <PreviewNav />
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

.full .preview {
  width: auto;
  height: auto;
  padding: 0;
}

.full .preview .photo {
  width: auto;
  height: auto;
  padding: var(--side-padding);
  background: none !important;
  margin: 0 auto;
}

.full .preview .placeholder {
  display: none !important;
}
</style>
