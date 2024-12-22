<script lang="ts">
  import { downloadCanvas } from './donwload-canvas';

  const sizesMap = {
    s: 500,
    m: 1500,
    l: 2500
  };

  type Direction = 'vertical' | 'horizontal';
  type Size = keyof typeof sizesMap;
  type RenderOptions = {
    size: Size;
    direction: Direction;
    spacing: number;
  };

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

  let direction: Direction = 'horizontal';
  let size: Size = 'm';
  let spacing: number = 3;

  function render(
    ctx: CanvasRenderingContext2D,
    images: Array<HTMLImageElement>,
    { direction, size, spacing }: RenderOptions
  ) {
    const aspects = images.map((image) => image.width / image.height);
    const realSize = sizesMap[size];
    const realSpacing = realSize * (spacing / 100);
    const rects = aspects.map((aspect) => {
      if (direction === 'vertical') {
        return [realSize, Math.round(realSize / aspect)];
      }
      return [Math.round(realSize * aspect), realSize];
    });
    const totalLength = rects.map(([w, h]) => {
      return direction === 'vertical' ? h : w;
    }).reduce((a, b) => a + b, realSpacing * (images.length + 1));

    if (direction === 'vertical') {
      ctx.canvas.width = realSize + realSpacing * 2;
      ctx.canvas.height = totalLength;
    } else {
      ctx.canvas.width = totalLength;
      ctx.canvas.height = realSize + realSpacing * 2;
    }

    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    let offset = realSpacing;
    images.forEach((image, i) => {
      const rect = rects[i];
      if (direction === 'vertical') {
        ctx.drawImage(image, realSpacing, offset, rect[0], rect[1]);
        offset += rect[1] + realSpacing;
      } else {
        ctx.drawImage(image, offset, realSpacing, rect[0], rect[1]);
        offset += rect[0] + realSpacing;
      }
    });
  }

  let canvas: HTMLCanvasElement;
  $: ctx = canvas?.getContext('2d');
  $: {
    if (ctx) {
      render(ctx, images, { direction, size, spacing });
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
  .canvas {
    max-width: 100%;
    display: block;
  }
</style>

<input type="file" multiple accept="image/png, image/jpeg" on:change={handleFiles}>

<canvas bind:this={canvas} class="canvas" />

<button on:click={handleSave}>Save</button>


