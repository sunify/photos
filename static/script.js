(() => {
  const preview = document.querySelector('.preview');

  if (preview) {
    preview.addEventListener('click', () => {
      preview.classList.toggle('full');
    });

    const previewImg = preview.querySelector('img');
    const preloadImg = new Image();

    preloadImg.onload = () => {
      previewImg.src = preloadImg.src;
      preview.classList.add('loaded');
    };
    preloadImg.src = previewImg.dataset.src;
  }

})();