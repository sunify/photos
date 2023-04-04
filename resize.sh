rm -r images
mkdir -p images
mkdir -p images/thumbs
mkdir -p images/full

mogrify -path images/thumbs -strip -interlace plane -resize 1000x1000 -quality 90 photos/*.jpg
mogrify -path images/full -resize 3000x3000 -quality 100 photos/*.jpg