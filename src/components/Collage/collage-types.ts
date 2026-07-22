export type CollagePage = {
  id: string;
  files: File[];
  urls: string[];
  images: HTMLImageElement[];
  selectedImage: number | null;
};
