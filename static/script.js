(() => {
  const preview = document.querySelector('.preview');

  preview?.addEventListener('click', () => {
    preview.classList.toggle('full');
  })
})();