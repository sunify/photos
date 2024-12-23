<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let isOpen = false;
  export let label = 'Меню';

  let detailsEl: HTMLDetailsElement;

  // Синхронизируем внешнее состояние с details
  $: if (detailsEl) {
    detailsEl.open = isOpen;
  }

  function handleToggle(event: Event) {
    isOpen = (event.target as HTMLDetailsElement).open;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      isOpen = false;
      detailsEl?.querySelector('summary')?.focus();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });
</script>

<details
  bind:this={detailsEl}
  on:toggle={handleToggle}
  class="dropdown"
>
  <summary class="summary">
    <slot name="trigger" />
  </summary>

  {#if isOpen}
    <nav
      class="menu"
      aria-label={label}
      transition:fade={{ duration: 100 }}
    >
      <slot />
    </nav>
  {/if}
</details>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown[open] .summary::before {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    content: " ";
    background: transparent;
  }

  .summary {
    list-style: none;
    cursor: pointer;
  }

  .summary::-webkit-details-marker {
    display: none;
  }

  .menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 50;
    min-width: max-content;
    margin-top: 0.5rem;
  }
</style>