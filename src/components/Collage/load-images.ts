export async function loadImages(urls: Array<string>): Promise<Array<HTMLImageElement>> {
  return Promise.all(
    urls.map((url) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.src = url;
      });
    })
  );
}
