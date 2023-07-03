<script lang="ts">
export let prevPhotoId: string | null = null;
export let nextPhotoId: string | null = null;

let link: HTMLAnchorElement;

function goBack(fallbackLocation: string) {
  window.history.back();
  setTimeout(() => {
    window.location = fallbackLocation as any;
  }, 50);
}

function goToPhotoId(photoId: string) {
  window.history.replaceState(null, '', `./${photoId}`);
  window.location.reload();
}

function handleKeyup(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    goBack('.');
  }

  if (e.key === 'ArrowLeft' && prevPhotoId) {
    goToPhotoId(prevPhotoId);
  }

  if (e.key === 'ArrowRight' && nextPhotoId) {
    goToPhotoId(nextPhotoId);
  }
}

function handleClick(e: MouseEvent) {
  e.preventDefault();
  goBack(link.href);
}
</script>

<svelte:window on:keyup={handleKeyup} />

<a href="." class="back" bind:this={link} on:click={handleClick}>Back</a>

<style>
.back {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: var(--top-padding);

  text-decoration: none;
  color: inherit;
  font-size: 0;
}

.back::after {
  content: '';
  width: calc(var(--top-padding) / 4);
  height: calc(var(--top-padding) / 4);
  position: absolute;
  border: 2px solid;
  border-top: 0;
  border-left: 0;
  left: 50%;
  top: 65%;
  transform: translate(-50%, -50%) rotate(225deg);
}

.back:hover {
  color: blue;
}
</style>