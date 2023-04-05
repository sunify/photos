(() => {
  const preview = document.querySelector('.preview');

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
          goBack('.')
        }
      }
    });

    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      goBack(e.target.href);
    });
  }
})();
