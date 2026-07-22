<script lang="ts">
  import { onMount } from 'svelte';
  import type { Layout } from './collage-layouts';
  import type { CollagePage } from './collage-types';

  export let page: CollagePage;
  export let layout: Layout;
  export let cutByThirds = false;
  export let cutByHalves = false;
  export let render: (context: CanvasRenderingContext2D, layout: Layout, pageId: string) => void;
  export let registerCanvas: (pageId: string, canvas: HTMLCanvasElement | null) => void;
  export let addImages: (event: Event, pageId: string) => void;
  export let selectImage: (pageId: string, imageIndex: number) => void;

  let canvas: HTMLCanvasElement;
  let wrapper: HTMLElement;
  let wrapperSize = { w: 0, h: 0 };

  $: verticalWrapper = layout.w / layout.h < wrapperSize.w / wrapperSize.h;
  $: context = canvas?.getContext('2d');
  $: if (context && layout.items.length) {
    requestAnimationFrame(() => render(context, layout, page.id));
  }

  function updateWrapperSize() {
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    wrapperSize = { w: rect.width, h: rect.height };
  }

  onMount(() => {
    registerCanvas(page.id, canvas);
    updateWrapperSize();

    return () => registerCanvas(page.id, null);
  });
</script>

<svelte:window on:resize={updateWrapperSize} />

<section
  id="page-{page.id}"
  class="page"
  style="--page-aspect: {layout.w / layout.h}"
  aria-label="Collage page"
>
  <div class="canvasWrapper {verticalWrapper ? 'vertical' : 'horizontal'}" bind:this={wrapper}>
    <div class="canvasFrame">
      <div class="pageToolbar">
        <label class="input" aria-label="Add images to this page">
          <span class="button">+</span>
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg"
            on:change={(event) => addImages(event, page.id)}
          />
        </label>
      </div>
      <canvas bind:this={canvas} />
      <div
        class="grid {cutByThirds ? 'cutByThirds' : ''} {cutByHalves ? 'cutByHalves' : ''}"
        style="aspect-ratio: {layout.w / layout.h}"
      >
        {#each layout.items as item, imageIndex}
          <button
            type="button"
            class:selected={page.selectedImage === imageIndex}
            class="gridItem"
            style="
              width: {item.w / layout.w * 100}%;
              height: {item.h / layout.h * 100}%;
              left: {item.x / layout.w * 100}%;
              top: {item.y / layout.h * 100}%;
            "
            aria-label="Select image {imageIndex + 1} to reorder"
            on:click={() => selectImage(page.id, imageIndex)}
          />
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .page {
    position: relative;
    flex: 0 0 min(var(--page-max-width), calc(var(--page-height) * var(--page-aspect)));
    width: min(var(--page-max-width), calc(var(--page-height) * var(--page-aspect)));
    height: var(--page-height);
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }

  .pageToolbar {
    position: absolute;
    z-index: 3;
    top: 10px;
    left: 10px;
  }

  .canvasWrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .canvasFrame {
    position: relative;
    overflow: hidden;
    background: #0d0d0d;
    border: 1px solid #242424;
    border-radius: 8px;
  }

  .canvasWrapper.vertical .canvasFrame,
  .canvasWrapper.vertical canvas,
  .canvasWrapper.vertical .grid {
    height: 100%;
  }

  .canvasWrapper.horizontal .canvasFrame,
  .canvasWrapper.horizontal canvas,
  .canvasWrapper.horizontal .grid {
    width: 100%;
  }

  canvas {
    display: block;
  }

  .grid {
    position: absolute;
    inset: 0;
  }

  .gridItem {
    position: absolute;
    appearance: none;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .gridItem.selected {
    outline: 3px solid rgba(255, 255, 255, 0.9);
    outline-offset: -3px;
  }

  .grid.cutByHalves::before {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    border-right: 2px solid rgba(0, 0, 0, 0.45);
    pointer-events: none;
  }

  .grid.cutByThirds::before,
  .grid.cutByThirds::after {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    width: calc(100% / 3);
    height: 100%;
    pointer-events: none;
  }

  .grid.cutByThirds::before {
    left: 0;
    border-right: 2px solid rgba(0, 0, 0, 0.45);
  }

  .grid.cutByThirds::after {
    right: 0;
    border-left: 2px solid rgba(0, 0, 0, 0.45);
  }

  .input {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .input input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .button {
    display: block;
    min-width: 34px;
    padding: 5px 12px;
    color: #000;
    background: #fff;
    border: 1px solid #bbb;
    border-radius: 3px;
    font: inherit;
    font-size: 16px;
    line-height: 1.4;
    text-align: center;
  }
</style>
