<script lang="ts">
  import { nanoid } from 'nanoid';
  import { onDestroy, tick } from 'svelte';
  import Dropdown from '../Dropdown.svelte';
  import RadioGroup from '../RadioGroup.svelte';
  import CollagePageView from './CollagePage.svelte';
  import { canvasToFile, saveImages } from './donwload-canvas';
  import { sizesMap, layouts, type Layout } from './collage-layouts';
  import type { CollagePage } from './collage-types';
  import { loadImages } from './load-images';

  type Size = keyof typeof sizesMap;
  type LayoutType = keyof typeof layouts;
  type IdleCapableWindow = Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  function getFromStorage<T extends string>(key: string, defaultValue: T) {
    return (localStorage.getItem(key) || defaultValue) as T;
  }

  function saveToStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  function prepareAspectRatio(raw: string): 'auto' | number {
    return raw === 'auto' ? raw : Number(raw);
  }

  function predictLayoutType(images: HTMLImageElement[]): LayoutType {
    const aspectRatios = images.map((image) => image.width / image.height);
    const verticalLength = aspectRatios.reduce((sum, aspect) => sum + aspect, 0);
    const horizontalLength = aspectRatios.reduce((sum, aspect) => sum + 1 / aspect, 0);
    return verticalLength < horizontalLength ? 'horizontal' : 'vertical';
  }

  function padLayoutToAspectRatio(layout: Layout, aspectRatio: 'auto' | number) {
    if (aspectRatio === 'auto') return layout;

    const layoutAspectRatio = layout.w / layout.h;
    if (layoutAspectRatio > aspectRatio) {
      const newHeight = layout.w / aspectRatio;
      const offset = (newHeight - layout.h) / 2;
      layout.items.forEach((item) => item.y += offset);
      layout.h = newHeight;
    } else {
      const newWidth = layout.h * aspectRatio;
      const offset = (newWidth - layout.w) / 2;
      layout.items.forEach((item) => item.x += offset);
      layout.w = newWidth;
    }
    return layout;
  }

  const TWELVE_BY_FIVE = (12 / 5).toString();
  const EIGHT_BY_FIVE = (8 / 5).toString();

  let pages: CollagePage[] = [];
  let canvasByPage = new Map<string, HTMLCanvasElement>();
  let noiseTextures = new Map<string, HTMLCanvasElement>();
  let isSettingsOpen = false;
  let isSaving = false;
  let saveError = '';
  let isPreparingFiles = false;
  let preparedFiles: File[] = [];
  let preparationRevision = 0;
  let preparationTimer: ReturnType<typeof setTimeout> | null = null;
  let preparationIdleCallback: number | null = null;
  let preparationRunning = false;

  let backgroundColor = getFromStorage('backgroundColor', '#FFFFFF');
  let layoutType: LayoutType = getFromStorage<LayoutType>('layoutType', 'horizontal');
  let size: Size = getFromStorage<Size>('size', 'm');
  let spacing = Number(getFromStorage('spacing', '3'));
  let padding = Number(getFromStorage('padding', '3'));
  let aspectRatio = getFromStorage('aspectRatio', 'auto');
  let cutByThirds = aspectRatio === TWELVE_BY_FIVE;
  let cutByHalves = aspectRatio === EIGHT_BY_FIVE;
  let noise = getFromStorage('noise', 'false') === 'true';
  let noiseOverImage = getFromStorage('noiseOverImage', 'false') === 'true';
  let noiseIntensity = Number(getFromStorage('noiseIntensity', '0.2'));
  let noiseSmoothness = Number(getFromStorage('noiseSmoothness', '0'));
  let noiseSize = Number(getFromStorage('noiseSize', '1'));

  $: pageViews = pages.map((page) => ({
    page,
    layout: padLayoutToAspectRatio(
      layouts[layoutType](page.images, { size, spacing, padding }),
      prepareAspectRatio(aspectRatio)
    )
  }));
  $: emptyPageAspectRatio = aspectRatio === 'auto'
    ? pageViews[pageViews.length - 1]?.layout.w / pageViews[pageViews.length - 1]?.layout.h || 1
    : Number(aspectRatio);
  $: firstPageAspectRatio = pageViews[0]?.layout.w / pageViews[0]?.layout.h || emptyPageAspectRatio;

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

  $: if (aspectRatio !== TWELVE_BY_FIVE) cutByThirds = false;
  $: if (aspectRatio !== EIGHT_BY_FIVE) cutByHalves = false;
  $: {
    noiseIntensity;
    noiseSmoothness;
    noiseSize;
    noiseTextures.clear();
  }
  $: {
    pageViews;
    backgroundColor;
    noise;
    noiseOverImage;
    noiseIntensity;
    noiseSmoothness;
    noiseSize;
    renderAllCanvases();
    scheduleFilePreparation();
  }

  function registerCanvas(pageId: string, canvas: HTMLCanvasElement | null) {
    if (canvas) {
      canvasByPage.set(pageId, canvas);
      scheduleFilePreparation();
    } else {
      canvasByPage.delete(pageId);
    }
  }

  function makeNoiseTexture() {
    const key = [noiseIntensity, noiseSmoothness, noiseSize].join(':');
    const cached = noiseTextures.get(key);
    if (cached) return cached;

    // Keep the tile divisible by the grain size so its edges repeat exactly.
    const tileSize = noiseSize * Math.ceil(1024 / noiseSize);
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = tileSize;
    baseCanvas.height = tileSize;
    const context = baseCanvas.getContext('2d');
    if (!context) return baseCanvas;

    const imageData = context.createImageData(tileSize, tileSize);
    const data = imageData.data;
    for (let y = 0; y < tileSize; y += noiseSize) {
      for (let x = 0; x < tileSize; x += noiseSize) {
        const value = Math.floor((Math.random() - 0.5) * 255 * noiseIntensity);
        const blockHeight = Math.min(noiseSize, tileSize - y);
        const blockWidth = Math.min(noiseSize, tileSize - x);
        for (let dy = 0; dy < blockHeight; dy += 1) {
          for (let dx = 0; dx < blockWidth; dx += 1) {
            const pixel = x + dx + (y + dy) * tileSize;
            const index = pixel * 4;
            data[index] = value + 128;
            data[index + 1] = value + 128;
            data[index + 2] = value + 128;
            data[index + 3] = 255 * noiseIntensity;
          }
        }
      }
    }
    context.putImageData(imageData, 0, 0);
    if (noiseSmoothness === 0) {
      noiseTextures.set(key, baseCanvas);
      return baseCanvas;
    }

    // Blur a wrapped 3x3 copy and crop its centre to keep the tile seamless.
    const blurPadding = Math.max(2, Math.ceil(noiseSmoothness * 3));
    const wrappedCanvas = document.createElement('canvas');
    wrappedCanvas.width = tileSize + blurPadding * 2;
    wrappedCanvas.height = tileSize + blurPadding * 2;
    const wrappedContext = wrappedCanvas.getContext('2d');
    if (!wrappedContext) return baseCanvas;
    for (let y = blurPadding - tileSize; y < wrappedCanvas.height; y += tileSize) {
      for (let x = blurPadding - tileSize; x < wrappedCanvas.width; x += tileSize) {
        wrappedContext.drawImage(baseCanvas, x, y);
      }
    }

    const blurredCanvas = document.createElement('canvas');
    blurredCanvas.width = wrappedCanvas.width;
    blurredCanvas.height = wrappedCanvas.height;
    const blurredContext = blurredCanvas.getContext('2d');
    if (!blurredContext) return baseCanvas;
    blurredContext.filter = `blur(${noiseSmoothness}px)`;
    blurredContext.drawImage(wrappedCanvas, 0, 0);

    const texture = document.createElement('canvas');
    texture.width = tileSize;
    texture.height = tileSize;
    texture.getContext('2d')?.drawImage(
      blurredCanvas,
      blurPadding, blurPadding, tileSize, tileSize,
      0, 0, tileSize, tileSize
    );
    noiseTextures.set(key, texture);
    return texture;
  }

  function pageNoiseOffset(pageId: string, tileSize: number) {
    let hash = 0;
    for (let index = 0; index < pageId.length; index += 1) {
      hash = Math.imul(31, hash) + pageId.charCodeAt(index) | 0;
    }
    return {
      x: Math.abs(hash) % tileSize,
      y: Math.abs(Math.imul(hash, 17)) % tileSize
    };
  }

  function applyNoise(context: CanvasRenderingContext2D, pageId: string) {
    const texture = makeNoiseTexture();
    const pattern = context.createPattern(texture, 'repeat');
    if (!pattern) return;
    const offset = pageNoiseOffset(pageId, texture.width);

    context.save();
    context.translate(offset.x, offset.y);
    context.fillStyle = pattern;
    context.globalCompositeOperation = 'hard-light';
    context.fillRect(-offset.x, -offset.y, context.canvas.width, context.canvas.height);
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 0.2;
    context.fillRect(-offset.x, -offset.y, context.canvas.width, context.canvas.height);
    context.restore();
  }

  function render(context: CanvasRenderingContext2D, layout: Layout, pageId: string) {
    context.canvas.width = layout.w;
    context.canvas.height = layout.h;
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, layout.w, layout.h);

    if (noise && !noiseOverImage) applyNoise(context, pageId);
    layout.items.forEach(({ image, x, y, w, h }) => context.drawImage(image, x, y, w, h));
    if (noise && noiseOverImage) applyNoise(context, pageId);
  }

  async function renderAllCanvases() {
    await tick();
    pageViews.forEach(({ page, layout }) => {
      const context = canvasByPage.get(page.id)?.getContext('2d');
      if (context) render(context, layout, page.id);
    });
  }

  async function handleFiles(event: Event, pageId?: string) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    input.value = '';
    if (!files.length) return;

    const urls = files.map((file) => URL.createObjectURL(file));
    const images = await loadImages(urls);

    if (!pageId) {
      const newPageId = nanoid();
      pages = [...pages, { id: newPageId, files, urls, images, selectedImage: null }];
      layoutType = predictLayoutType(images);
      await tick();
      document.getElementById(`page-${newPageId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
      return;
    }

    const page = pages.find((item) => item.id === pageId);
    if (!page) {
      urls.forEach(URL.revokeObjectURL);
      return;
    }
    const nextImages = [...page.images, ...images];
    pages = pages.map((item) => item.id === pageId
      ? { ...item, files: [...item.files, ...files], urls: [...item.urls, ...urls], images: nextImages, selectedImage: null }
      : item
    );
    layoutType = predictLayoutType(nextImages);
  }

  function selectImage(pageId: string, imageIndex: number) {
    pages = pages.map((page) => {
      if (page.id !== pageId) return page;
      if (page.selectedImage === imageIndex) return { ...page, selectedImage: null };
      if (page.selectedImage === null) return { ...page, selectedImage: imageIndex };

      const first = page.selectedImage;
      const swap = <T,>(items: T[]) => {
        const result = [...items];
        [result[first], result[imageIndex]] = [result[imageIndex], result[first]];
        return result;
      };
      return {
        ...page,
        files: swap(page.files),
        urls: swap(page.urls),
        images: swap(page.images),
        selectedImage: null
      };
    });
  }

  async function filesForCanvas(canvas: HTMLCanvasElement, page: CollagePage, pageNumber: number) {
    const result: File[] = [];
    const pageName = `collage-${pageNumber}`;

    if (cutByThirds || cutByHalves) {
      const parts = cutByThirds ? 3 : 2;
      const partCanvas = document.createElement('canvas');
      const context = partCanvas.getContext('2d');
      if (!context) return result;
      partCanvas.height = canvas.height;
      partCanvas.width = canvas.width / parts;
      for (let index = 0; index < parts; index += 1) {
        context.clearRect(0, 0, partCanvas.width, partCanvas.height);
        context.drawImage(
          canvas,
          partCanvas.width * index, 0, partCanvas.width, partCanvas.height,
          0, 0, partCanvas.width, partCanvas.height
        );
        result.push(await canvasToFile(partCanvas, `${pageName}-${index + 1}`));
      }
      return result;
    }

    const singleImageName = page.files.length === 1
      ? `${page.files[0].name.split('.').slice(0, -1).join('.')}-collage`
      : pageName;
    result.push(await canvasToFile(canvas, pages.length === 1 ? singleImageName : pageName));
    return result;
  }

  function scheduleFilePreparation() {
    const revision = ++preparationRevision;
    preparedFiles = [];
    cancelScheduledPreparation();
    if (!pages.length) {
      isPreparingFiles = false;
      return;
    }

    isPreparingFiles = true;
    queueFilePreparation(revision, 250);
  }

  function cancelScheduledPreparation() {
    if (preparationTimer !== null) clearTimeout(preparationTimer);
    preparationTimer = null;

    const idleWindow = window as IdleCapableWindow;
    if (preparationIdleCallback !== null) {
      idleWindow.cancelIdleCallback?.(preparationIdleCallback);
      preparationIdleCallback = null;
    }
  }

  function queueFilePreparation(revision: number, delay: number) {
    preparationTimer = setTimeout(() => {
      preparationTimer = null;
      const startPreparation = () => {
        preparationIdleCallback = null;
        if (revision !== preparationRevision) return;
        if (preparationRunning) {
          queueFilePreparation(revision, 100);
          return;
        }
        void prepareFiles(revision);
      };

      const idleWindow = window as IdleCapableWindow;
      if (idleWindow.requestIdleCallback) {
        preparationIdleCallback = idleWindow.requestIdleCallback(startPreparation, { timeout: 800 });
      } else {
        startPreparation();
      }
    }, delay);
  }

  async function prepareFiles(revision: number) {
    preparationRunning = true;
    try {
      await tick();
      const collageFiles: File[] = [];
      pageViews.forEach(({ page, layout }) => {
        const canvas = canvasByPage.get(page.id);
        const context = canvas?.getContext('2d');
        if (context) render(context, layout, page.id);
      });
      for (let index = 0; index < pages.length; index += 1) {
        const canvas = canvasByPage.get(pages[index].id);
        if (canvas) collageFiles.push(...await filesForCanvas(canvas, pages[index], index + 1));
      }

      if (revision !== preparationRevision) return;
      preparedFiles = collageFiles;
      isPreparingFiles = false;
    } catch (error) {
      console.error('Could not prepare collage files', error);
      if (revision === preparationRevision) isPreparingFiles = false;
    } finally {
      preparationRunning = false;
      if (
        revision !== preparationRevision
        && pages.length
        && preparationTimer === null
        && preparationIdleCallback === null
      ) {
        queueFilePreparation(preparationRevision, 0);
      }
    }
  }

  function handleSave() {
    if (isSaving || isPreparingFiles || !preparedFiles.length) return;
    isSaving = true;
    saveError = '';
    // The share call must happen in the same task as the tap on iOS.
    void saveImages(preparedFiles)
      .then((result) => {
        if (result === 'downloaded') {
          saveError = 'Web Share API отсутствует в этом браузере';
        }
      })
      .catch((error) => {
        const name = error instanceof DOMException ? error.name : 'ShareError';
        const message = error instanceof Error ? error.message : String(error);
        saveError = `${name}: ${message}`;
      })
      .finally(() => {
        isSaving = false;
      });
  }

  function handleReset() {
    pages.flatMap((page) => page.urls).forEach(URL.revokeObjectURL);
    pages = [];
    canvasByPage.clear();
    noiseTextures.clear();
    preparedFiles = [];
    isPreparingFiles = false;
    preparationRevision += 1;
    cancelScheduledPreparation();
  }

  onDestroy(handleReset);
</script>

{#if pages.length}
  <div class="panel">
    <RadioGroup
      options={[
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ]}
      bind:value={layoutType}
    />

    <Dropdown bind:isOpen={isSettingsOpen}>
      <div class="button" slot="trigger">Settings</div>
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
            { value: (1 / 1).toString(), label: '1/1' },
            { value: (3 / 4).toString(), label: '3/4' },
            { value: (4 / 3).toString(), label: '4/3' },
            { value: (4 / 5).toString(), label: '4/5' },
            { value: (5 / 4).toString(), label: '5/4' },
            { value: (16 / 9).toString(), label: '16/9' },
            { value: (9 / 16).toString(), label: '9/16' },
            { value: EIGHT_BY_FIVE, label: '8/5' },
            { value: TWELVE_BY_FIVE, label: '12/5' },
          ]}
          bind:value={aspectRatio}
        />
        {#if aspectRatio === TWELVE_BY_FIVE}
          <label><input type="checkbox" bind:checked={cutByThirds} /> Cut by 3s</label>
        {/if}
        {#if aspectRatio === EIGHT_BY_FIVE}
          <label><input type="checkbox" bind:checked={cutByHalves} /> Cut by halves</label>
        {/if}
        <input type="color" bind:value={backgroundColor} aria-label="Background color" />
        <label>Spacing: <input type="range" min="0" max="10" step="1" bind:value={spacing} /></label>
        <label>Padding: <input type="range" min="0" max="10" step="1" bind:value={padding} /></label>
        <label><input type="checkbox" bind:checked={noise} /> Noise</label>
        {#if noise}
          <label><input type="checkbox" bind:checked={noiseOverImage} /> Noise over image</label>
          <label>Intensity: <input type="range" min="0" max="1" step="0.05" bind:value={noiseIntensity} /></label>
          <label>Smoothness: <input type="range" min="0" max="3" step="0.5" bind:value={noiseSmoothness} /></label>
          <label>Size: <input type="range" min="1" max="5" step="1" bind:value={noiseSize} /></label>
        {/if}
      </div>
    </Dropdown>
  </div>
{/if}

<main
  class="pagesScroller"
  style="--first-page-aspect: {firstPageAspectRatio}; --last-page-aspect: {emptyPageAspectRatio}"
  aria-label="Collage pages"
>
  <div class="edgeSpacer first" aria-hidden="true"></div>
  {#each pageViews as { page, layout } (page.id)}
    <CollagePageView
      {page}
      {layout}
      {cutByThirds}
      {cutByHalves}
      {render}
      {registerCanvas}
      addImages={handleFiles}
      {selectImage}
    />
  {/each}

  <section
    class="emptyPage"
    style="--page-aspect: {emptyPageAspectRatio}"
    aria-label="Add collage page"
  >
    <label class="input">
      <span class="button">{pages.length ? 'Add page' : 'Add images'}</span>
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg"
        on:change={(event) => handleFiles(event)}
      />
    </label>
  </section>
  <div class="edgeSpacer last" aria-hidden="true"></div>
</main>

{#if pages.length}
  <div class="save">
    <button
      on:click={handleSave}
      class="button"
      disabled={isSaving || isPreparingFiles || !preparedFiles.length}
    >
      {isPreparingFiles ? 'Preparing…' : isSaving ? 'Saving…' : `Save ${pages.length}`}
    </button>
    <button on:click={handleReset} class="button reset">Reset</button>
    {#if saveError}
      <output class="saveError">{saveError}</output>
    {/if}
  </div>
{/if}

<style>
  .button {
    appearance: none;
    padding: 5px 15px;
    color: #000;
    background: #fff;
    border: 1px solid #bbb;
    border-radius: 3px;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    white-space: nowrap;
  }

  .button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .panel {
    position: fixed;
    z-index: 10;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 15px;
  }

  .pagesScroller {
    --page-max-width: min(82vw, 1200px);
    --page-height: calc(100vh - 170px);
    position: fixed;
    top: 60px;
    right: 0;
    bottom: 90px;
    left: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .pagesScroller::-webkit-scrollbar {
    display: none;
  }

  .emptyPage {
    position: relative;
    flex: 0 0 min(var(--page-max-width), calc(var(--page-height) * var(--page-aspect)));
    width: min(var(--page-max-width), calc(var(--page-height) * var(--page-aspect)));
    height: min(var(--page-height), calc(var(--page-max-width) / var(--page-aspect)));
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d0d0d;
    border: 1px dashed #444;
    border-radius: 8px;
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }

  .emptyPage .input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .edgeSpacer {
    height: 1px;
    flex-shrink: 0;
  }

  .edgeSpacer.first {
    flex-basis: max(0px, calc(
      (100vw - min(var(--page-max-width), calc(var(--page-height) * var(--first-page-aspect)))) / 2 - 16px
    ));
  }

  .edgeSpacer.last {
    flex-basis: max(0px, calc(
      (100vw - min(var(--page-max-width), calc(var(--page-height) * var(--last-page-aspect)))) / 2 - 16px
    ));
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

  .save {
    position: fixed;
    right: 0;
    bottom: 20px;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px;
  }

  .saveError {
    position: absolute;
    bottom: 52px;
    max-width: calc(100vw - 30px);
    padding: 6px 10px;
    color: #fff;
    background: #8b1d1d;
    border-radius: 4px;
    font: 12px/1.35 system-ui, sans-serif;
    text-align: center;
  }

  .settingsMenu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: min(300px, calc(100vw - 30px));
    max-height: calc(100vh - 90px);
    overflow-y: auto;
    padding: 15px;
    color: #000;
    background: #fff;
    border-radius: 6px;
  }

  .settingsMenu label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .settingsMenu input[type='range'] {
    width: 100px;
  }
</style>
