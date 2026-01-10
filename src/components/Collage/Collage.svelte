<script lang="ts">
  import RadioGroup from '../RadioGroup.svelte'
  import Dropdown from '../Dropdown.svelte'
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

  let urls: Array<string> = [];
  let files: Array<File> = [];
  let selectedImage: number | null = null;
  let images: Array<HTMLImageElement> = [];
  $: {
    loadImages(urls).then((result) => {
      images = result;
    });
  }

  function selectImage(i: number) {
    if (selectedImage === i) {
      return;
    }
    if (selectedImage !== null) {
      const i1 = selectedImage;
      const i2 = i;
      const url1 = urls[i1];
      const url2 = urls[i2];
      urls = urls.map((u, i) => {
        if (i === i1) {
          return url2;
        } else if(i === i2) {
          return url1;
        }

        return u;
      }) as string[];
      selectedImage = null;
    } else {
      selectedImage = i;
    }
  }

  function prepareAspectRatio(raw: string): 'auto' | number {
    if (raw === 'auto') {
      return raw;
    }

    return Number(raw);
  }

  const TWELVE_BY_FIVE = (12/5).toString();
  const EIGTH_BY_FIVE = (8/5).toString();

  let backgroundColor = getFromStorage('backgroundColor', '#FFFFFF');
  let layoutType: LayoutType = getFromStorage<LayoutType>('layoutType', 'horizontal');
  let size: Size = getFromStorage<Size>('size', 'm');
  let spacing: number = Number(getFromStorage('spacing', '3'));
  let padding: number = Number(getFromStorage('padding', '3'));
  let aspectRatio: string = getFromStorage('aspectRatio', 'auto');
  let cutByThirds: boolean = aspectRatio === TWELVE_BY_FIVE;
  let cutByHalves: boolean = aspectRatio === EIGTH_BY_FIVE;
  let noise: boolean = getFromStorage<string>('noise', 'false') === 'true';
  let noiseOverImage: boolean = getFromStorage<string>('noiseOverImage', 'false') === 'true';
  let noiseIntensity = Number(getFromStorage('noiseIntensity', '0.2'));
  let noiseSmoothness = Number(getFromStorage('noiseSmoothness', '0'));
  let noiseSize = Number(getFromStorage('noiseSize', '1'));
  $: {
    saveToStorage('backgroundColor', backgroundColor);
    saveToStorage('layoutType', layoutType);
    saveToStorage('size', size);
    saveToStorage('spacing', spacing.toString());
    saveToStorage('padding', padding.toString());
    saveToStorage('aspectRatio', aspectRatio);
    saveToStorage('noise', noise ? 'true' : 'false');
    saveToStorage('noiseOverImage', noiseOverImage ? 'true' : 'false');
    saveToStorage('noiseIntensity', noiseIntensity.toString());
    saveToStorage('noiseSmoothness', noiseSmoothness.toString());
    saveToStorage('noiseSize', noiseSize.toString());
  }
  $: {
    if (aspectRatio !== TWELVE_BY_FIVE) {
      cutByThirds = false;
    }

    if (aspectRatio !== EIGTH_BY_FIVE) {
      cutByHalves = false;
    }
  }

  $: layout = padLayoutToAspectRatio(layouts[layoutType](images, { size, spacing, padding }), prepareAspectRatio(aspectRatio));
  function predictLayoutType(images: Array<HTMLImageElement>): LayoutType {
    const aspectRatios = images.map((img) => img.width / img.height);
    const vertAr = aspectRatios.reduce((a, b) => a + b, 0);
    const horAr = aspectRatios.map((ar) => 1 / ar).reduce((a, b) => a + b, 0);

    return vertAr < horAr ? 'horizontal' : 'vertical';
  }
  function padLayoutToAspectRatio(layout: Layout, aspectRatio: 'auto' | number) {
    if (aspectRatio === 'auto') {
      return layout;
    }

    const layoutAspectRatio = layout.w / layout.h;
    if (layoutAspectRatio > aspectRatio) {
      const newH = layout.w / aspectRatio;
      const vertOffset = (newH - layout.h) / 2;
      layout.items.forEach((item) => {
        item.y += vertOffset;
      });
      layout.h = newH;
    } else {
      const newW = layout.h * aspectRatio;
      const horOffset = (newW - layout.w) / 2;
      layout.items.forEach((item) => {
        item.x += horOffset;
      });
      layout.w = newW;
    }
    return layout;
  }
  let shouldPredictLayout = true;
  $: {
    if (shouldPredictLayout && images.length > 0) {
      layoutType = predictLayoutType(images);
      shouldPredictLayout = false;
    }
  }

  $: {
    if (layout.w) {
      noiseObsolete = true;
    }
  }

  const noiseCanvas = document.createElement("canvas");
  const nctx = noiseCanvas.getContext("2d");


  let noiseObsolete = true;
  function recalcNoise(width: number, height: number) {
    if (!nctx) {
      return;
    }
    noiseCanvas.width = width;
    noiseCanvas.height = height;

    const idata = nctx.createImageData(width, height);
    const data = idata.data;

    for (let y = 0; y < height; y += noiseSize) {
      for (let x = 0; x < width; x += noiseSize) {
        const val = Math.floor((Math.random() - 0.5) * 255 * noiseIntensity);
        for (let dy = 0; dy < noiseSize; dy++) {
          for (let dx = 0; dx < noiseSize; dx++) {
            const px = (x + dx) + (y + dy) * width;
            if (px >= width * height) continue;
            const i = px * 4;
            data[i + 0] = val + 128; // R
            data[i + 1] = val + 128; // G
            data[i + 2] = val + 128; // B
            data[i + 3] = 255 * noiseIntensity;
          }
        }
      }
    }

    nctx.putImageData(idata, 0, 0);

    if (noiseSmoothness > 0) {
      // Применим размытие
      nctx.filter = `blur(${noiseSmoothness}px)`;
      nctx.drawImage(noiseCanvas, 0, 0);
    }
  }

  function applyNoise(ctx: CanvasRenderingContext2D) {
    if (noiseObsolete) {
      recalcNoise(ctx.canvas.width, ctx.canvas.height);
      noiseObsolete = false;
    }
    ctx.globalCompositeOperation = "hard-light";
    ctx.drawImage(noiseCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.2;
    ctx.drawImage(noiseCanvas, 0, 0);
    ctx.globalAlpha = 1;
  }

  function render(ctx: CanvasRenderingContext2D, layout: Layout, backgroundColor: string) {
    ctx.canvas.width = layout.w;
    ctx.canvas.height = layout.h;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, layout.w, layout.h);

    if (noise && !noiseOverImage) {
      applyNoise(ctx);
    }

    layout.items.forEach(({ image, x, y, w, h }, i) => {
      ctx.drawImage(image, x, y, w, h);
    });

    if (noise && noiseOverImage) {
      applyNoise(ctx);
    }
  }

  let canvas: HTMLCanvasElement | null = null;
  $: ctx = canvas?.getContext('2d');
  $: {
    console.log(noise, noiseOverImage, noiseIntensity, noiseSmoothness, noiseSize);
    if (ctx && images.length) {
      requestAnimationFrame(() => {
        render(ctx, layout, backgroundColor);
      });
    }
  }
  $: {
    console.log(noiseIntensity, noiseSmoothness, noiseSize);
    noiseObsolete = true;
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

  async function handleSave(e: MouseEvent) {
    e.preventDefault();
    if (canvas) {
      if (cutByThirds) {
        const thirdsCanvas = document.createElement('canvas');
        const ctx = thirdsCanvas.getContext('2d');
        if (!ctx) {
          return;
        }
        thirdsCanvas.height = canvas.height;
        thirdsCanvas.width = canvas.width / 3;
        for (let i = 0; i < 3; i += 1) {
          ctx.drawImage(
            canvas,
            thirdsCanvas.width * i, 0, thirdsCanvas.width, thirdsCanvas.height,
            0, 0, thirdsCanvas.width, thirdsCanvas.height
          );
          await downloadCanvas(thirdsCanvas, 'collage-thirds-' + (i + 1));
        }
      } else if (cutByHalves) {
        const halvesCanvas = document.createElement('canvas');
        const ctx = halvesCanvas.getContext('2d');
        if (!ctx) {
          return;
        }
        halvesCanvas.height = canvas.height;
        halvesCanvas.width = canvas.width / 2;
        for (let i = 0; i < 2; i += 1) {
          ctx.drawImage(
            canvas,
            halvesCanvas.width * i, 0, halvesCanvas.width, halvesCanvas.height,
            0, 0, halvesCanvas.width, halvesCanvas.height
          );
          await downloadCanvas(halvesCanvas, 'collage-havles-' + (i + 1));
        }
      } else {
        const name = files.length === 1 ? files[0].name.split('.').slice(0, -1).join('.') + '-collage' : 'collage';
        await downloadCanvas(canvas, name);
      }
    }
  }

  function handleFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      files = Array.from(input.files);
      urls = urls.concat(
        files.map((file) => URL.createObjectURL(file))
      );
      input.value = '';
      shouldPredictLayout = true;
    }
  }

  function handleReset() {
    urls = [];
    files = [];
  }

  let isSettingsOpen: boolean = false;
</script>

<svelte:window on:resize={handleResize} />

{#if images.length > 0}
  <div class="panel">
    <label class="input">
      <div class="button">+</div>
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg"
        on:change={handleFiles}
      />
    </label>

    <RadioGroup
      options={[
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ]}
      bind:value={layoutType}
      />

    <Dropdown bind:isOpen={isSettingsOpen}>
      <div class="button" slot="trigger">
        Settings
      </div>

      <div class="settingsMenu">
        <RadioGroup
          options={[
            { value: 's', label: 'S' },
            { value: 'm', label: 'M' },
            { value: 'l', label: 'L' },
          ]}
          bind:value={size}
        />
        <RadioGroup
          options={[
            { value: 'auto', label: 'Auto' },
            { value: (1/1).toString(), label: '1/1' },
            { value: (3/4).toString(), label: '3/4' },
            { value: (4/3).toString(), label: '4/3' },
            { value: (4/5).toString(), label: '4/5' },
            { value: (5/4).toString(), label: '5/4' },
            { value: (16/9).toString(), label: '16/9' },
            { value: (9/16).toString(), label: '9/16' },
            { value: EIGTH_BY_FIVE, label: '8/5' },
            { value: TWELVE_BY_FIVE, label: '12/5' },
          ]}
          bind:value={aspectRatio}
        />
        {#if aspectRatio === TWELVE_BY_FIVE}
          <label>
            <input type="checkbox" bind:checked={cutByThirds} />
            Cut by 3s
          </label>
        {/if}
        {#if aspectRatio === EIGTH_BY_FIVE}
          <label>
            <input type="checkbox" bind:checked={cutByHalves} />
            Cut by halves
          </label>
        {/if}
          <input type="color" bind:value={backgroundColor} />

          Spacing: <input type="range" class="spacingInput" min="0" max="10" step="1" bind:value={spacing} />
          Padding: <input type="range" class="spacingInput" min="0" max="10" step="1" bind:value={padding} />

        <label>
          <input type="checkbox" bind:checked={noise} />
          Noise
        </label>
        {#if noise}
          <label>
            <input type="checkbox" bind:checked={noiseOverImage} />
            Noise over image
          </label>
          Intensity: <input type="range" class="spacingInput" min="0" max="1" step="0.05" bind:value={noiseIntensity} />
          Smoothness: <input type="range" class="spacingInput" min="0" max="3" step="0.5" bind:value={noiseSmoothness} />
          Size: <input type="range" class="spacingInput" min="1" max="5" step="1" bind:value={noiseSize} />
        {/if}
      </div>
    </Dropdown>
  </div>
{/if}

<div
  class="canvasWrapper {verticalWrapper ? 'vertical' : 'horizontal'}"
  bind:this={wrapper}
>
  {#if images.length > 0}
    <canvas bind:this={canvas} class="canvas" />
    <div class="grid {cutByThirds ? 'cutByThirds' : ''}  {cutByHalves ? 'cutByHalves' : ''}" style="aspect-ratio: {layout.w / layout.h}">
      {#each layout.items as item, i}
        <div class="grid-item" style="
          width: {item.w / layout.w * 100}%;
          height: {item.h / layout.h * 100}%;
          left: {item.x / layout.w * 100}%;
          top: {item.y / layout.h * 100}%;
        "
        on:click={() => selectImage(i)}
        role="presentation"
        ></div>
      {/each}
    </div>
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
  <button on:click={handleReset} class="button reset">Reset</button>
</div>
{/if}

<style>
  .grid {
    position: absolute;
    opacity: 0.2;
  }

  .grid.cutByHalves::before {
    content: '';
    position: absolute;
    height: 100%;
    top: 0;
    width: 50%;
    left: 0;
    border-right: 2px solid #000;
  }

  .grid.cutByThirds::before,
  .grid.cutByThirds::after {
    content: '';
    position: absolute;
    height: 100%;
    top: 0;
    width: calc(100% / 3);
  }

  .grid.cutByThirds::before {
    left: 0;
    border-right: 2px solid #000;
  }

  .grid.cutByThirds::after {
    right: 0;
    border-left: 2px solid #000;
  }

  .grid-item {
    position: absolute;
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
    white-space: nowrap;
    border: 1px solid #bbb;
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

  .canvasWrapper.vertical .canvas,
  .canvasWrapper.vertical .grid {
    height: 100%;
  }

  .canvasWrapper.horizontal .canvas,
  .canvasWrapper.horizontal .grid {
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
    gap: 10px;
  }

  .panel {
    display: flex;
    margin: 15px;
    gap: 10px;
    position: fixed;
    z-index: 10;
    top: 0;
    right: 0;
    left: 0;
    justify-content: center;
  }

  .spacingInput {
    width: 100px;
  }

  .settingsMenu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    align-items: flex-start;
    background-color: #fff;
    color: #000;
    border-radius: 6px;
    max-width: 300px;
  }
</style>
