function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Could not create an image from the collage'));
      }
    }, 'image/jpeg', 0.95);
  });
}

export async function canvasToFile(canvas: HTMLCanvasElement, fileName: string) {
  const blob = await canvasToBlob(canvas);
  return new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
}

function downloadFiles(files: File[]) {
  const downloadLink = document.createElement('a');
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);

  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    downloadLink.href = url;
    downloadLink.download = file.name;
    downloadLink.click();
    URL.revokeObjectURL(url);
  });

  downloadLink.remove();
}

export async function saveImages(files: File[]) {
  const shareData: ShareData = { files };

  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try {
      await navigator.share(shareData);
      return 'shared' as const;
    } catch (error) {
      // Closing the share sheet is intentional and must not trigger a download.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled' as const;
      }
    }
  }

  downloadFiles(files);
  return 'downloaded' as const;
}
