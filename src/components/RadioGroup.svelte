<script lang="ts">
  import { nanoid } from 'nanoid';

  const name = nanoid();

  // Определяем типы для входных параметров
  export let options: { value: string; label: string }[] = [];
  export let value: string;
</script>

<div class="group">
  {#each options as option}
    <label class="wrapper">
      <input
        type="radio"
        name={name}
        bind:group={value}
        value={option.value}
      />
      <span class="button">{option.label}</span>
    </label>
  {/each}
</div>

<style>
  .group {
    display: flex;
    border: 1px solid #bbb;
    border-radius: 3px;
    max-width: 100%;
    overflow-y: auto;
    min-width: 0;
  }

  .wrapper {
    display: flex;
    cursor: pointer;
  }

  .button {
    font-size: 14px;
    padding: 5px 10px;
    color: #454545;
    background-color: #d2d2d2;
  }

  .wrapper:first-child .button {
    border-radius: 3px 0 0 3px;
  }

  .wrapper:last-child .button {
    border-radius: 0 3px 3px 0;
  }

  .wrapper + .wrapper .button {
    border-left: 1px solid #bbb;
  }

  .wrapper input {
    visibility: hidden;
    position: absolute;
    left: 0;
    right: 0;
    width: 0;
    height: 0;
    overflow: hidden;
  }

  .wrapper input:checked + .button {
    color: #000;
    background-color: #fff;
  }
</style>