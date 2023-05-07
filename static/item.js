(() => {
  const preview = document.querySelector('.preview');

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
    previewPlaceholder.style.display = 'block';
  }
  handleResize();
  window.addEventListener('resize', handleResize, { passive: true });

  previewImg.addEventListener('click', (e) => {
    const willBeFull = !document.documentElement.classList.contains('full');

    if (willBeFull) {
      const rect = previewPlaceholder.getBoundingClientRect();
      const x = e.pageX - rect.x;
      const y = e.pageY - rect.y;
      setTimeout(() => {
        const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        const roundPercents = (p) => Math.round(p * 100) / 100;
        window.scrollTo(
          maxScrollX * roundPercents(x / rect.width),
          maxScrollY * roundPercents(y / rect.height)
        );
      });
    }

    document.documentElement.classList.toggle('full');
    handleResize();
  });

  function goBack(fallbackLocation) {
    window.location = fallbackLocation;
  }

  function goToPhotoId(photoId) {
    window.location.href = `./${photoId}.html`;
  }

  window.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      if (document.documentElement.classList.contains('full')) {
        document.documentElement.classList.remove('full');
        handleResize();
      } else {
        goBack('.');
      }
    }

    if (e.key === 'ArrowLeft') {
      if (preview.dataset.prev) {
        goToPhotoId(preview.dataset.prev);
      }
    }

    if (e.key === 'ArrowRight') {
      goToPhotoId(preview.dataset.next);
    }
  });

  backButton.addEventListener('click', (e) => {
    e.preventDefault();
    goBack(e.target.href);
  });
})();
