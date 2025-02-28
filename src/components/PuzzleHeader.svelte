<script lang="ts">
import { onMount } from 'svelte';
import { isServer } from '../helpers/is-server';

const letters = 'alexlunёv'.split('');

let positions = Array.from({ length: 9 }, (_, i) => i + 1);
let inPlaying = false;
let gapSize = 'inherit';
let shutterSound: HTMLAudioElement | null = null;

$: isWon = !positions.some((n, i, arr) => n > arr[i + 1]) && inPlaying && !isServer();
$: {
  if (isWon) {
    setTimeout(() => {
      gapSize = '0px';

      try {
        shutterSound?.play();
      } catch (e) {}
    }, 300);
  }
}

const coordsFromIndex = (index: number) => {
  const x = index % 3;
  const y = Math.floor(index / 3);
  return [x, y];
}

function isMoveAvailable(from: number, to: number) {
  const [fromX, fromY] = coordsFromIndex(from);
  const [toX, toY] = coordsFromIndex(to);

  const diff = Math.abs(fromX - toX) + Math.abs(fromY - toY);

  return diff === 1;
}

let selectedIndex: number | null = null;
let selectedPos: number | null = null;
let shakeIndex: number | null = null;
function handlePieceClick(e: MouseEvent | KeyboardEvent) {
  if (isWon) {
    return;
  }

  const target = (e.target as HTMLElement);

  const i = Number(target.dataset.num) - 1;
  const pos = Number(target.dataset.pos) - 1;

  if (selectedIndex === i) {
    return;
  }

  if (selectedIndex === null || selectedPos === null) {
    selectedIndex = i;
    selectedPos = pos;
  } else if (isMoveAvailable(selectedPos, pos)) {
    const temp = positions[i];
    positions[i] = positions[selectedIndex];
    positions[selectedIndex] = temp;
    selectedIndex = null;
    selectedPos = null;
  } else {
    shakeIndex = i;
    setTimeout(() => {
      shakeIndex = null;
    }, 500);
  }
}

onMount(() => {
  shutterSound = new Audio('shutter-sound.mp3');
  setTimeout(() => {
    positions = positions.sort(() => 0.5 - Math.random());
    inPlaying = true;
  }, 300);
});
</script>

<header class="cover">
  <div class="cover-box" style="--gap-size: {gapSize}">
    <div class="pieces">
      {#each positions as pos, i}
        <div
          class="piece {shakeIndex === i ? 'shake' : ''}"
          data-num={i + 1}
          data-pos={pos}
          on:click={handlePieceClick}
          on:keyup={handlePieceClick}
          role="button"
          tabindex="-1"
        />
      {/each}
    </div>

    <div class="letters">
      {#each letters as letter}
        <div class="letter" style={letter === 'ё' ? `font-style: italic` : ''}>
          <span>{letter}</span>
        </div>
      {/each}
    </div>
  </div>

  {#if isWon}
    <div class="shutter" />
  {/if}
</header>

<style>
.cover {
  --cell-size: 100px;
  --gap-size: 20px;
  --over-size: 25vh;

  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(var(--cell-size) * 3 + var(--over-size));
  position: relative;
}

.cover-box {
  position: relative;

  width: calc(var(--cell-size) * 3 + var(--gap-size) * 2);
  height: calc(var(--cell-size) * 3 + var(--gap-size) * 2);
  gap: var(--gap-size);

  --bg: #FFF;
  background-color: var(--bg);
  box-shadow: 0 0 0 var(--gap-size) var(--bg);
}

.piece {
  position: absolute;
  width: var(--cell-size);
  height: var(--cell-size);
  background-image: url(../cover.jpg);
  background-size: calc(var(--cell-size) * 3) calc(var(--cell-size) * 3);
  transition: top 0.3s ease-in-out, left 0.3s ease-in-out;
}

.letter {
  position: absolute;
  width: var(--cell-size);
  height: var(--cell-size);
  pointer-events: none;
}

.letter span {
  color: #fff;
  font-size: calc(var(--cell-size) / 2.5);
  line-height: calc(var(--cell-size) / 2.5);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.piece[data-num='1'] {
  background-position: 0 0;
}

.piece[data-num='2'] {
  background-position: calc(var(--cell-size) * -1) 0;
}

.piece[data-num='3'] {
  background-position: calc(var(--cell-size) * -2) 0;
}

.piece[data-num='4'] {
  background-position: 0 calc(var(--cell-size) * -1);
}

.piece[data-num='5'] {
  background-position: calc(var(--cell-size) * -1) calc(var(--cell-size) * -1);
}

.piece[data-num='6'] {
  background-position: calc(var(--cell-size) * -2) calc(var(--cell-size) * -1);
}

.piece[data-num='7'] {
  background-position: 0 calc(var(--cell-size) * -2);
}

.piece[data-num='8'] {
  background-position: calc(var(--cell-size) * -1) calc(var(--cell-size) * -2);
}

.piece[data-num='9'] {
  background-position: calc(var(--cell-size) * -2) calc(var(--cell-size) * -2);
}

.piece[data-pos='1'],
.letter:nth-child(1) {
  left: 0;
  top: 0;
}

.piece[data-pos='2'],
.letter:nth-child(2) {
  left: calc(var(--cell-size) + var(--gap-size));
  top: 0;
}

.piece[data-pos='3'],
.letter:nth-child(3) {
  left: calc(var(--cell-size) * 2 + var(--gap-size) * 2);
  top: 0;
}

.piece[data-pos='4'],
.letter:nth-child(4) {
  left: 0;
  top: calc(var(--cell-size) + var(--gap-size));
}

.piece[data-pos='5'],
.letter:nth-child(5) {
  left: calc(var(--cell-size) + var(--gap-size));
  top: calc(var(--cell-size) + var(--gap-size));
}

.piece[data-pos='6'],
.letter:nth-child(6) {
  left: calc(var(--cell-size) * 2 + var(--gap-size) * 2);
  top: calc(var(--cell-size) + var(--gap-size));
}

.piece[data-pos='7'],
.letter:nth-child(7) {
  left: 0;
  top: calc(var(--cell-size) * 2 + var(--gap-size) * 2);
}

.piece[data-pos='8'],
.letter:nth-child(8) {
  left: calc(var(--cell-size) + var(--gap-size));
  top: calc(var(--cell-size) * 2 + var(--gap-size) * 2);
}

.piece[data-pos='9'],
.letter:nth-child(9) {
  left: calc(var(--cell-size) * 2 + var(--gap-size) * 2);
  top: calc(var(--cell-size) * 2 + var(--gap-size) * 2);
}

@keyframes shutter {
  0% {
    opacity: 1;
  }

  99.9% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.shutter {
  position: absolute;
  left: -10%;
  top: -10%;
  width: 110%;
  height: 110%;
  background-color: #fff;
  pointer-events: none;
  opacity: 0;
  animation: shutter 0.5s;
  animation-delay: 300ms;
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-2px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(4px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-8px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(8px, 0, 0);
  }
}

.shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@media screen and (max-width: 640px) {
  .cover {
    --cell-size: 75px;
    --gap-size: 10px;
    --over-size: 20vh;
  }
}
</style>
