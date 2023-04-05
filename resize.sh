rm -r images
mkdir -p images
mkdir -p images/thumbs
mkdir -p images/full

mogrify -path images/thumbs -interlace plane -resize 900x900 -quality 80 photos/*.jpg
mogrify -path images/full -resize 2000x2000 -quality 90 photos/*.jpg