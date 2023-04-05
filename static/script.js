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

    preview.addEventListener('click', () => {
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

    const shutter = document.querySelector('.cover-shutter');
    function releaseShutter() {
      shutter.classList.add('cheese');
      setTimeout(() => {
        shutter.classList.remove('cheese');
      }, 300)
    }

    let sawWinMessage = false;
    function handlePieceClick(e) {
      const currentPiece = e.target;
      if (selectedPiece) {
        const selectedPos = selectedPiece.dataset.pos;
        selectedPiece.dataset.pos = currentPiece.dataset.pos;
        currentPiece.dataset.pos = selectedPos;
        selectedPiece = null;
        if (areYaWinningSon() && !sawWinMessage) {
          setTimeout(() => {
            releaseShutter();
            randomizePieces();
            sawWinMessage = false;
          }, 500);
          sawWinMessage = true;
        }
      } else {
        selectedPiece = currentPiece;
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
      piece.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          handlePieceClick(e);
        }
      });
    });
  }
})();
