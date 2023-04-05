(() => {
  const preview = document.querySelector('.preview');
  const coverBox = document.querySelector('.cover-box');

  if (preview) {
    const backButton = document.querySelector('.back');
    const previewImg = preview.querySelector('img');
    const previewPlaceholder = preview.querySelector('.preview-placeholder');
    const preloadImg = new Image();

    preloadImg.onload = () => {
      previewImg.src = preloadImg.src;
      preview.classList.add('loaded');
    };
    preloadImg.src = previewImg.dataset.src;

    function handleResize() {
      const ogAspectRatio = Number(previewImg.dataset.aspect);
      const isTaller = ogAspectRatio < previewImg.width / previewImg.height;
      previewPlaceholder.classList.toggle('-v', isTaller);
      previewPlaceholder.classList.toggle('-h', !isTaller);
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    previewImg.addEventListener('click', () => {
      document.documentElement.classList.toggle('full');
      handleResize();
    });

    function goBack(fallbackLocation) {
      window.history.back();
      setTimeout(() => {
        window.location = fallbackLocation;
      }, 50);
    }

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        if (document.documentElement.classList.contains('full')) {
          document.documentElement.classList.remove('full');
        } else {
          goBack('.');
        }
      }
    });

    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      goBack(e.target.href);
    });
  }

  if (coverBox) {
    let selectedPiece = null;
    const pieces = coverBox.querySelectorAll('.cover-box-item');

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
      }, 500)
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

    function randomizePieces() {
      const nums = Array.from({ length: pieces.length }, (_, i) => i + 1).sort(
        () => 0.5 - Math.random()
      );
      pieces.forEach((piece, i) => {
        piece.style.animationDelay = `${400 + nums[i] * 50}ms`;
        piece.style.animationPlayState = 'running';
        piece.dataset.num = nums[i];
        piece.dataset.pos = i + 1;
      });
    }

    randomizePieces();
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
        'ArrowUp': [0, -1],
        'ArrowDown': [0, 1],
        'ArrowLeft': [-1, 0],
        'ArrowRight': [1, 0],
      }[e.key];
      if (direction) {
        e.preventDefault();
        coords[0] = clamp(coords[0] + direction[0], 0, 2);
        coords[1] = clamp(coords[1] + direction[1], 0, 2);
        updateCursor();
      }
    });
  }
})();
