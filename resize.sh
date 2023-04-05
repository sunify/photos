rm -r images
mkdir -p images
mkdir -p images/thumbs
mkdir -p images/full

mogrify -path images/thumbs -interlace plane -resize 1200x1200 -quality 90 photos/*.jpg
mogrify -path images/full -resize 3000x3000 -quality 100 photos/*.jpg