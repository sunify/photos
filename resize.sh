rm -r images
mkdir -p images
mkdir -p images/thumbs
mkdir -p images/full

mogrify -path images/full -units PixelsPerInch -density 72 -interlace plane -resize 2500x2500 -quality 90 photos/*.jpg
mogrify -path images/thumbs -units PixelsPerInch -density 72 -interlace plane -resize 900x900 -quality 80 photos/*.jpg