(() => {
  const preview = document.querySelector('.preview');

  if (preview) {
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
      preview.classList.toggle('full');
      handleResize();
    });

    window.addEventListener('keyup', (e) => {
      if(e.key === 'Escape') {
        if (preview.classList.contains('full')) {
          preview.classList.remove('full');
        } else {
          window.location = '..';
        }
      }
    })
  }
})();
