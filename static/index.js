(() => {
  const coverBox = document.querySelector('.cover-box');

  let selectedPiece = null;
  const boxPieces = coverBox.querySelector('.cover-box-pieces');
  const pieces = Array.from({ length: 9 }, (_, i) => {
    const piece = document.createElement('div');
    piece.classList.add('cover-box-item');
    piece.tabIndex = '-1';
    piece.dataset.num = i + 1;
    piece.dataset.pos = i + 1;
    boxPieces.appendChild(piece);

    return piece;
  });

  function randomizePieces() {
    const nums = Array.from({ length: pieces.length }, (_, i) => i + 1).sort(
      () => 0.5 - Math.random()
    );
    pieces.forEach((piece, i) => {
      piece.dataset.pos = nums[i];
    });
  }

  setTimeout(() => {
    randomizePieces();
  }, 300);

  function areYaWinningSon() {
    let winning = true;
    for (const piece of pieces) {
      if (piece.dataset.num !== piece.dataset.pos) {
        winning = false;
        break;
      }
    }

    return winning;
  }

  const shutterSound = new Audio('static/shutter-sound.mp3');
  const shutter = document.querySelector('.cover-shutter');
  function releaseShutter() {
    shutter.classList.add('cheese');
    coverBox.style.setProperty('--gap-size', '0px');
    shutterSound.play().catch(() => {});
    setTimeout(() => {
      shutter.classList.remove('cheese');
    }, 500);
  }

  let sawWinMessage = false;
  function handlePieceClick(e) {
    const currentPiece = e.target;
    if (selectedPiece) {
      const selectedPos = selectedPiece.dataset.pos;
      selectedPiece.dataset.pos = currentPiece.dataset.pos;
      currentPiece.dataset.pos = selectedPos;
      selectedPiece = null;
      updateCursor();
      if (areYaWinningSon() && !sawWinMessage) {
        setTimeout(() => {
          releaseShutter();
          pieces.forEach((piece, i) => {
            piece.removeEventListener('click', handlePieceClick);
            piece.removeEventListener('keyup', handlePieceKeyup);
          });
        }, 500);
        sawWinMessage = true;
      }
    } else {
      selectedPiece = currentPiece;
    }
  }

  function handlePieceKeyup(e) {
    if (e.key === 'Enter') {
      handlePieceClick(e);
    }
  }

  pieces.forEach((piece, i) => {
    piece.addEventListener('click', handlePieceClick);
    piece.addEventListener('keyup', handlePieceKeyup);
  });

  const coords = [0, 0];
  coverBox.addEventListener('focus', () => {
    updateCursor();
  });

  function clamp(n, from, to) {
    if (n > to) {
      return from;
    } else if (n < from) {
      return to;
    }
    return n;
  }

  function updateCursor() {
    const [x, y] = coords;
    const pos = 1 + x + y * 3;
    coverBox.querySelector(`[data-pos="${pos}"]`).focus();
  }

  coverBox.addEventListener('keydown', (e) => {
    const direction = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    }[e.key];
    if (direction) {
      e.preventDefault();
      coords[0] = clamp(coords[0] + direction[0], 0, 2);
      coords[1] = clamp(coords[1] + direction[1], 0, 2);
      updateCursor();
    }
  });
})();