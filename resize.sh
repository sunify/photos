mkdir -p build/images
mkdir -p build/images/thumbs
mkdir -p build/images/full

mogrify -path build/images/thumbs -resize 1000x1000 -quality 90 photos/*.jpg
mogrify -path build/images/full -resize 3000x3000 -quality 100 photos/*.jpg