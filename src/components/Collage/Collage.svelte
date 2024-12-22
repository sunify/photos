<script lang="ts">
  import { downloadCanvas } from './donwload-canvas';
  import { sizesMap, layouts } from './collage-layouts';
  import { loadImages } from './load-images';

  type Size = keyof typeof sizesMap;
  type LayoutType = keyof typeof layouts;
  type Layout = ReturnType<typeof layouts.horizontal>;

  function getFromStorage<T extends string>(key: string, defaultValue: T) {
    return (localStorage.getItem(key) || defaultValue) as T;
  }

  function saveToStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  let urls: Array<string> = [
    'https://sunify.github.io/photos/images/full/DSCF2407.jpg',
    'https://sunify.github.io/photos/images/full/DSCF2330.jpg'
  ];
  let images: Array<HTMLImageElement> = [];
  $: {
    loadImages(urls).then((result) => {
      images = result;
    });
  }

  let backgroundColor = getFromStorage('backgroundColor', '#FFFFFF');
  let layoutType: LayoutType = getFromStorage<LayoutType>('layoutType', 'horizontal');
  let size: Size = getFromStorage<Size>('size', 'm');
  let spacing: number = Number(getFromStorage('spacing', '3'));
  $: {
    saveToStorage('backgroundColor', backgroundColor);
    saveToStorage('layoutType', layoutType);
    saveToStorage('size', size);
    saveToStorage('spacing', spacing.toString());
  }

  $: layout = layouts[layoutType](images, { size, spacing });

  function render(ctx: CanvasRenderingContext2D, layout: Layout, backgroundColor: string) {
    ctx.canvas.width = layout.w;
    ctx.canvas.height = layout.h;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, layout.w, layout.h);

    layout.items.forEach(({ image, x, y, w, h }, i) => {
      ctx.drawImage(image, x, y, w, h);
    });
  }

  let canvas: HTMLCanvasElement | null = null;
  $: ctx = canvas?.getContext('2d');
  $: {
    if (ctx) {
      requestAnimationFrame(() => {
        render(ctx, layout, backgroundColor);
      });
    }
  }

  let wrapper: HTMLElement | null = null;
  let wrapperSize: { w: number; h: number } = { w: 0, h: 0 };
  $: verticalWrapper = layout.w / layout.h < wrapperSize.w / wrapperSize.h;

  function updateWrapperSize(wrapper: HTMLElement | null) {
    if (!wrapper) {
      return;
    }
    const rect = wrapper.getBoundingClientRect();
    wrapperSize.w = rect.width;
    wrapperSize.h = rect.height;
  }

  $: {
    updateWrapperSize(wrapper);
  }

  function handleResize() {
    updateWrapperSize(wrapper);
  }

  function handleSave(e: MouseEvent) {
    e.preventDefault();
    if (canvas) {
      downloadCanvas(canvas, 'collage');
    }
  }

  function handleFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      urls = urls.concat(
        Array.from(input.files).map((file) => URL.createObjectURL(file))
      );
      input.value = '';
    }
  }

  function handleReset() {
    urls = [];
  }
</script>

<svelte:window on:resize={handleResize} />

{#if images.length > 0}
  <div class="panel">
    <label class="input">
      <div class="button">Add images</div>
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg"
        on:change={handleFiles}
      />
    </label>

    <select bind:value={size}>
      <option value="s">Small</option>
      <option value="m">Medium</option>
      <option value="l">Large</option>
    </select>
    <select bind:value={layoutType}>
      <option value="horizontal">Horizontal</option>
      <option value="vertical">Vertical</option>
    </select>
    <input type="range" min="0" max="10" step="1" bind:value={spacing} />
    <input type="color" bind:value={backgroundColor} />

    <button on:click={handleReset} class="button reset">Reset</button>
  </div>
{/if}

<div
  class="canvasWrapper {verticalWrapper ? 'vertical' : 'horizontal'}"
  bind:this={wrapper}
>
  {#if images.length > 0}
    <canvas bind:this={canvas} class="canvas" />
  {:else}
    <label class="input">
      <div class="button">Add images</div>
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg"
        on:change={handleFiles}
      />
    </label>
  {/if}
</div>

{#if images.length > 0}
<div class="save">
  <button on:click={handleSave} class="button">Save</button>
</div>
{/if}

<style>
  .reset {
    position: absolute;
    right: 0;
  }


  .button {
    appearance: none;
    color: #000;
    background-color: #fff;
    border-radius: 3px;
    padding: 5px 15px;
    cursor: pointer;
    border: none;
    font: inherit;
    font-size: 14px;
  }

  .canvasWrapper {
    position: fixed;
    top: 60px;
    bottom: 90px;
    left: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .canvas {
    display: block;
  }

    height: 100%;
  }

    width: 100%;
  }

  .input {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .input input {
    position: absolute;
    opacity: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .save {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 20px;
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel {
    display: flex;
    margin: 15px;
    gap: 10px;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
  }
</style>
