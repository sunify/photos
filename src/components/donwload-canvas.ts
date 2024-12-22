const downloadLink = document.createElement('a');
document.body.appendChild(downloadLink);
downloadLink.style.display = 'none';

export function downloadCanvas(canvas: HTMLCanvasElement, fileName: string) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, 'blank')
        // downloadLink.href = url;
        // downloadLink.download = `${fileName}.jpg`;
        // downloadLink.click();
        URL.revokeObjectURL(url);
        resolve(blob);
      }
    }, 'image/jpeg');
  });
}
