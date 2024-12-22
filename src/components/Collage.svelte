<script lang="ts">
  import { downloadCanvas } from './donwload-canvas';
  import { sizesMap, layouts } from './collage-layouts';

  type Size = keyof typeof sizesMap;
  type LayoutType = keyof typeof layouts;
  type Layout = ReturnType<typeof layouts.horizontal>;

  let urls: Array<string> = [];
  let images: Array<HTMLImageElement> = [];
  $: {
    Promise.all(
      urls.map((url) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const image = new Image();
          image.onload = () => {
            resolve(image);
          };
          image.src = url;
        });
      })
    ).then((result) => {
      images = result;
    });
  }

  let layoutType: LayoutType = 'horizontal';
  let size: Size = 'm';
  let spacing: number = 3;
  $: layout = layouts[layoutType](images, { size, spacing });

  function render(
    ctx: CanvasRenderingContext2D,
    layout: Layout
  ) {
    ctx.canvas.width = layout.w;
    ctx.canvas.height = layout.h;

    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, layout.w, layout.h);

    layout.items.forEach(({ image, x, y, w, h}, i) => {
      ctx.drawImage(image, x, y, w, h);
    });
  }

  let canvas: HTMLCanvasElement;
  $: ctx = canvas?.getContext('2d');
  $: {
    if (ctx) {
      render(ctx, layout);
    }
  }

  function handleSave(e: MouseEvent) {
    e.preventDefault();
    downloadCanvas(canvas, 'collage');
  }

  function handleFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      urls = urls.concat(Array.from(input.files).map((file) => URL.createObjectURL(file)));
      input.value = '';
    }
  }
</script>

<style>
  .canvasWrapper {
    max-height: 80vh;
    margin: 0 auto;
    padding: 0 20px;
  }

  .canvas {
    display: block;
    width: 100%;
    object-fit: contain;
  }

  .input {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .inputLabel {
    color: #000;
    background-color: #fff;
    border-radius: 3px;
    padding: 5px 15px;
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
    bottom: 0;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel {
    display: flex;
    padding: 30px;
    gap: 10px;
  }
</style>

<div class="panel">
  <label class="input">
    <div class="inputLabel">Add images</div>
    <input type="file" multiple accept="image/png, image/jpeg" on:change={handleFiles}>
  </label>

  {#if images.length > 0}
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
  {/if}
</div>

{#if images.length > 0}
  <div class="canvasWrapper">
    <canvas bind:this={canvas} class="canvas" />
  </div>
{/if}

<div class="save">
  <button on:click={handleSave}>Save</button>
</div>
